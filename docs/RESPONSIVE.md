# RESPONSIVE.md — Sitewide Responsive Guide (Nexus226)

## But
Transformer l'ensemble du site en responsive fiable : desktop (2xl/xl/lg), tablet (md), mobile (sm). Maintenir accessibilité WCAG AA. Aucune modification logique.

## Breakpoints
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

## Grid conventions
- mobile: `grid-cols-1`
- md: `md:grid-cols-2`
- lg: `lg:grid-cols-3`
- xl: `xl:grid-cols-4`
- 2xl: `2xl:grid-cols-5`

## Container
Use:
```html
<div class="max-w-[min(1200px,100%)] mx-auto px-4 md:px-6 lg:px-8"></div>
```

## Typography (recommended clamp utilities)
- `.text-responsive-sm` : `clamp(0.875rem, 1.6vw, 1rem)`
- `.text-responsive-base` : `clamp(1rem, 1.8vw, 1.125rem)`
- `.text-responsive-lg` : `clamp(1.125rem, 2vw, 1.25rem)`
- `.text-responsive-xl` : `clamp(1.25rem, 2.2vw, 1.5rem)`
- `.text-responsive-2xl` : `clamp(1.5rem, 2.4vw, 1.875rem)`
- `.text-responsive-3xl` : `clamp(1.875rem, 3vw, 2.25rem)`

## Header / Nav
- sticky: `sticky top-0 z-50 backdrop-blur-sm`
- desktop: inline nav with `whitespace-nowrap`
- mobile: accessible hamburger (`aria-controls`, `aria-expanded`), drawer `role="dialog"`, `aria-modal="true"`

## Cards
- Desktop image: 64×64; Mobile image: 48×48
- Mobile description: `line-clamp-2`; Desktop `line-clamp-3`
- Hover reveal (desktop only) via `group-hover` + `max-height` transition (CSS only)

## Modals
- Mobile: `fixed inset-0` full-screen
- Desktop: centered dialog `max-w-xl mx-auto mt-20`
- ARIA: `role="dialog"`, `aria-modal="true"`, keyboard trap focus

## Accessibility
- All icon-only buttons: `aria-label="..."` and focus-visible styles
- Ensure color contrast >= WCAG AA
- Ensure keyboard navigation and focus management on menus and modals

## Testing checklist
- No horizontal scroll at all listed viewports
- Grid columns match conventions
- Header sticky and links no wrap
- Contact modal responsive and keyboard-operable

## Viewports for manual QA
- 2560×1440
- 1920×1080
- 1366×768
- 1280×800
- 834×1194
- 390×844
- 360×800
