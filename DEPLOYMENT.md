# Nexus226 - Deployment Checklist

## 📋 Pre-Deployment Checklist

### 1. Environment Variables Configuration

Configure the following environment variables in your Vercel project settings:

#### Supabase Configuration
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here  # Admin operations only
```

#### Cloudflare Turnstile (Captcha)
```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key_here
TURNSTILE_SECRET_KEY=your_secret_key_here
```

#### Upstash Redis (Rate Limiting) - Optional but Recommended
```bash
REDIS_URL=https://your-redis.upstash.io
REDIS_TOKEN=your_redis_token_here
```

> **Note**: The `NEXT_PUBLIC_` prefix makes variables accessible in the browser. Keep secret keys (SERVICE_KEY, SECRET_KEY, REDIS_TOKEN) without this prefix.

---

## 🗄️ Supabase Configuration

### 2. Enable Realtime on Tables

In your Supabase Dashboard:

1. Navigate to **Database** → **Replication**
2. Enable Realtime for the following tables:
   - ✅ `chat_messages`
   - ✅ `service_proposals`
   - ✅ `services`

### 3. Verify Row Level Security (RLS) Policies

Ensure RLS is enabled and policies are configured for:

#### `chat_messages`
- **SELECT**: Authenticated users can read messages in their categories
- **INSERT**: Authenticated users can send messages
- **UPDATE/DELETE**: Only message author or admin

#### `service_proposals`
- **SELECT**: User can see their own proposals, admins see all
- **INSERT**: Authenticated users can create proposals
- **UPDATE**: Only admins can update status

#### `services`
- **SELECT**: Public read access for active services
- **INSERT**: Only admins (via API)
- **UPDATE/DELETE**: Only admins

#### `admin_logs`
- **SELECT**: Only admins
- **INSERT**: Only admins (via API)

### 4. Database Indexes

Verify these indexes exist for performance:

```sql
-- Chat messages by category
CREATE INDEX IF NOT EXISTS idx_chat_messages_category 
ON chat_messages(category_id, created_at DESC);

-- Proposals by status
CREATE INDEX IF NOT EXISTS idx_proposals_status 
ON service_proposals(status, created_at DESC);

-- Services by category and status
CREATE INDEX IF NOT EXISTS idx_services_category_status 
ON services(category_id, status);
```

---

## 🔐 Security Checklist

### 5. Cloudflare Turnstile Setup

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Turnstile**
3. Create a new site:
   - **Domain**: `your-domain.vercel.app` (or custom domain)
   - **Widget Mode**: Managed
4. Copy the **Site Key** and **Secret Key**
5. Add to Vercel environment variables

### 6. Rate Limiting Setup (Upstash Redis)

1. Go to [Upstash Console](https://console.upstash.com/)
2. Create a new Redis database:
   - **Name**: `nexus226-ratelimit`
   - **Region**: Choose closest to your Vercel region
   - **Type**: Pay as you go (free tier available)
3. Copy **REST URL** and **REST TOKEN**
4. Add to Vercel environment variables as `REDIS_URL` and `REDIS_TOKEN`

> **Alternative**: If not using Redis, the in-memory rate limiter will work but won't persist across serverless function instances.

---

## 🚀 Vercel Deployment

### 7. Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your Git repository (GitHub/GitLab/Bitbucket)
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (if monorepo, adjust accordingly)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### 8. Add Environment Variables

In Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add all variables from step 1
3. Select environments: **Production**, **Preview**, **Development**

### 9. Deploy

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

Or simply push to your `main` branch if auto-deployment is enabled.

---

## ✅ Post-Deployment Verification

### 10. Test Critical Flows

After deployment, verify:

#### Authentication
- [ ] User registration works
- [ ] User login works
- [ ] Session persistence across page reloads
- [ ] Logout works

#### Realtime Chat
- [ ] Messages appear in real-time
- [ ] 3-second cooldown enforced
- [ ] Admin badges display correctly
- [ ] Auto-scroll to latest messages

#### Proposal Submission
- [ ] Captcha loads and verifies
- [ ] Rate limiting (5/hour) enforced
- [ ] Form validation works
- [ ] Success message displays

#### Admin Dashboard
- [ ] Only admins can access `/admin/proposals`
- [ ] Non-admins redirected to homepage
- [ ] Proposals table loads
- [ ] Validate/Reject buttons work
- [ ] Admin logs created

### 11. Performance Checks

- [ ] Lighthouse score > 90 (Performance)
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] No console errors in production

### 12. Security Checks

- [ ] HTTPS enabled (automatic with Vercel)
- [ ] CSP headers configured (if needed)
- [ ] Rate limiting active
- [ ] Captcha blocking bots
- [ ] RLS policies enforced

---

## 🔧 Troubleshooting

### Common Issues

#### "Captcha not loading"
- Verify `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set
- Check domain is whitelisted in Cloudflare Turnstile settings
- Ensure script is not blocked by ad blockers

#### "Realtime not working"
- Verify Realtime is enabled in Supabase for tables
- Check browser console for WebSocket errors
- Ensure `NEXT_PUBLIC_SUPABASE_URL` is correct

#### "Rate limiting not working"
- If using Redis: verify `REDIS_URL` and `REDIS_TOKEN`
- If in-memory: note it resets on serverless function cold starts
- Check API route logs for rate limit errors

#### "Admin can't validate proposals"
- Verify user has `role: 'admin'` in `users` table
- Check `SUPABASE_SERVICE_KEY` is set (if using service role)
- Review API logs for transaction errors

---

## 📊 Monitoring & Analytics

### 13. Setup Monitoring (Optional)

Consider adding:

- **Vercel Analytics**: Built-in, enable in project settings
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Supabase Dashboard**: Database metrics

---

## 🎉 Launch Checklist

Before announcing your launch:

- [ ] All environment variables configured
- [ ] Supabase Realtime enabled
- [ ] RLS policies tested
- [ ] Captcha working
- [ ] Rate limiting active
- [ ] Admin dashboard functional
- [ ] Legal pages accessible (`/terms`, `/privacy`)
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Performance optimized
- [ ] Security hardened
- [ ] Backup strategy in place

---

## 📞 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Review Supabase logs (Database → Logs)
3. Inspect browser console for client-side errors
4. Verify all environment variables are set correctly

---

**Deployment Command**:
```bash
vercel --prod
```

**Last Updated**: 2025-11-28
**Version**: 1.0.0
