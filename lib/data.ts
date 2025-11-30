import { createClient } from '@/lib/supabase/server';
import type { ServiceWithUser, Category, UserProfile } from '@/types/database';

/**
 * Fetch all categories from the database
 * Sorted by display_order for manual ordering control
 */
export async function getCategories(): Promise<Category[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true })
        .order('name'); // Secondary sort by name

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }

    return data as Category[];
}

/**
 * Fetch all categories with active service counts
 * Root categories sorted by display_order for manual ordering control
 */
export async function getCategoriesWithCounts(): Promise<(Category & { service_count: number })[]> {
    const supabase = await createClient();

    const [categoriesResult, servicesResult] = await Promise.all([
        (supabase.from('categories') as any).select('*').is('parent_id', null)
            .order('display_order', { ascending: true })
            .order('name'), // Secondary sort by name
        supabase.from('services').select('category_id').eq('status', 'active')
    ]);

    if (categoriesResult.error) {
        console.error('Error fetching categories:', categoriesResult.error);
        return [];
    }

    const counts: Record<string, number> = {};
    servicesResult.data?.forEach((s: any) => {
        if (s.category_id) {
            counts[s.category_id] = (counts[s.category_id] || 0) + 1;
        }
    });

    return (categoriesResult.data as any[]).map((cat: any) => ({
        ...cat,
        service_count: counts[cat.id] || 0
    }));
}

/**
 * Fetch a single category by slug or ID
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
    console.log(`🔍 getCategoryBySlug called with: "${slug}"`);
    const supabase = await createClient();

    // Helper to normalize strings for comparison
    const normalize = (str: string) => {
        return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[^a-z0-9]+/g, '-')     // Replace non-alphanumeric with hyphens
            .replace(/(^-|-$)+/g, '');       // Remove leading/trailing hyphens
    };

    // Fetch all categories to find the matching one
    const { data: allCategories, error } = await supabase
        .from('categories')
        .select('*')
        .returns<Category[]>(); // Explicitly type the return value

    if (error) {
        console.error('Error fetching categories for slug lookup:', error);
        return null;
    }

    if (!allCategories) return null;

    // Find the category where the normalized name matches the requested slug
    const matchingCategory = allCategories.find(cat => normalize(cat.name) === slug);

    if (matchingCategory) {
        console.log(`   ✅ Found matching category: "${matchingCategory.name}" for slug "${slug}"`);
        return matchingCategory;
    }

    console.log(`   ❌ No category found for slug "${slug}"`);

    // Fallback: Try direct name match (legacy support)
    const directMatch = allCategories.find(cat => cat.name.toLowerCase() === slug.replace(/-/g, ' ').toLowerCase());
    if (directMatch) {
        console.log(`   ✅ Found direct match fallback: "${directMatch.name}"`);
        return directMatch;
    }

    return null;
}

/**
 * Fetch random services with intelligent sorting
 * Uses a combination of random ordering and popularity score
 */
export async function getRandomServices(limit: number = 12): Promise<ServiceWithUser[]> {
    const supabase = await createClient();

    // Fetch active services with user and category data
    const { data, error } = await supabase
        .from('services')
        .select(`
      *,
      users:user_id (id, username, role, created_at, avatar_url),
      proposer:proposer_id (id, username, avatar_url),
      categories:category_id (*)
    `)
        .eq('status', 'active')
        .limit(limit * 2); // Fetch more to randomize from

    if (error) {
        console.error('Error fetching services:', error);
        return [];
    }

    // Shuffle and limit
    const shuffled = (data || [])
        .sort(() => Math.random() - 0.5)
        .slice(0, limit);

    return shuffled as ServiceWithUser[];
}

/**
 * Fetch services by category
 */
export async function getServicesByCategory(categoryId: string): Promise<ServiceWithUser[]> {
    const supabase = await createClient();

    // 1. Fetch all categories to build the hierarchy
    // We need this to find all descendants of the current category
    const { data: allCategories } = await supabase
        .from('categories')
        .select('id, parent_id');

    // 2. Find all descendant category IDs recursively
    const getAllDescendantIds = (parentId: string, categories: { id: string, parent_id: string | null }[]): string[] => {
        const children = categories.filter(c => c.parent_id === parentId);
        let ids = children.map(c => c.id);

        for (const child of children) {
            ids = [...ids, ...getAllDescendantIds(child.id, categories)];
        }

        return ids;
    };

    const targetCategoryIds = [
        categoryId,
        ...(allCategories ? getAllDescendantIds(categoryId, allCategories) : [])
    ];

    console.log(`[getServicesByCategory] Fetching services for category ${categoryId} and descendants:`, targetCategoryIds);

    // 3. Fetch services for all identified categories
    const { data, error } = await supabase
        .from('services')
        .select(`
      *,
      users:user_id (id, username, role, created_at, avatar_url),
      proposer:proposer_id (id, username, avatar_url),
      categories:category_id (*)
    `)
        .in('category_id', targetCategoryIds)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching services by category:', error);
        return [];
    }

    return data as ServiceWithUser[];
}

/**
 * Get current user from server-side session
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
    const supabase = await createClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return null;
    }

    // Fetch user profile
    const { data: profile } = await supabase
        .from('users')
        .select('id, username, role, created_at')
        .eq('id', user.id)
        .single();

    if (!profile) {
        return null;
    }

    return profile as UserProfile;
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
    const user = await getCurrentUser();
    return user?.role === 'admin';
}
