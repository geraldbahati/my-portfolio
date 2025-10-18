# Background Color Transition Implementation

## Overview

This implementation provides a smooth, accessible background color transition system for the portfolio website. The solution follows SSR/CSR best practices, maintains SEO-friendly server rendering, and provides smooth animated transitions between sections.

## Architecture & Approach

### Design Principles

1. **SSR/CSR Separation**: Sections remain server components for SEO, while only animation logic runs on the client
2. **Performance First**: Uses IntersectionObserver for efficient scroll detection, minimizes layout thrashing
3. **Accessibility**: Respects `prefers-reduced-motion` and provides proper contrast
4. **Modularity**: Easy to extend for additional sections and color schemes

### Key Components

- **`BackgroundColorSwitcher`**: Client component handling background transitions
- **`usePrefersReducedMotion`**: Accessibility hook for motion preferences
- **Section Identifiers**: Data attributes on target sections for observer targeting

## Implementation Details

### BackgroundColorSwitcher

```tsx
// Fixed positioned motion.div animates behind content
<motion.div
  className="fixed inset-0 -z-50 pointer-events-none"
  animate={{ backgroundColor: targetColor }}
/>
```

**Key Features:**
- Uses IntersectionObserver for efficient section visibility detection
- Configurable thresholds per section (default: 0.5 = 50% visible)
- Automatic dark/light theme detection based on background luminance
- CSS custom properties for theme coordination
- Respect for reduced motion preferences

### Intersection Thresholds

- **ProjectsSection**: `threshold: 0.3` (30% visible triggers white background)
- **FAQSection**: `threshold: 0.5` (50% visible triggers black background)

**Rationale**: Lower threshold for projects section ensures white background appears earlier in the scroll, providing better contrast for the light-colored projects section content.

### Animation Configuration

```tsx
{
  animationDuration: 0.8, // seconds
  animationEasing: "easeInOut", // Framer Motion easing
  updateCSSVariables: true // Enable theme CSS variables
}
```

## Usage

### Basic Implementation

```tsx
import BackgroundColorSwitcher from "@/components/BackgroundColorSwitcher.client";

<BackgroundColorSwitcher
  targets={[
    {
      id: "ProjectsSectionPinned",
      color: "#ffffff",
      threshold: 0.3,
    },
    {
      id: "ExpertiseFaqSection",
      color: "#000000",
      textColor: "#ffffff",
      threshold: 0.5,
    },
  ]}
  defaultColor="#ffffff"
/>
```

### Section Setup

Add `data-section-id` to target sections:

```tsx
<section data-section-id="ProjectsSectionPinned">
  {/* Section content */}
</section>
```

## Configuration Options

### BackgroundTarget Interface

```typescript
interface BackgroundTarget {
  id: string;           // Matches data-section-id attribute
  color: string;        // Background color (hex, rgb, named)
  textColor?: string;   // Optional text color override
  threshold?: number;   // Intersection threshold (0-1, default: 0.5)
}
```

### Props Configuration

```typescript
interface BackgroundColorSwitcherProps {
  targets: BackgroundTarget[];          // Section configurations
  defaultColor?: string;                // Fallback color
  animationDuration?: number;           // Animation duration (seconds)
  animationEasing?: string;             // Framer Motion easing
  updateCSSVariables?: boolean;         // Enable CSS custom properties
}
```

## CSS Custom Properties

When `updateCSSVariables` is enabled, the following CSS variables are available:

```css
:root {
  --page-bg-color: #ffffff;    /* Current background color */
  --page-text-color: #000000;  /* Explicitly set text color */
  --page-text-auto: #000000;   /* Auto-calculated contrast color */
}

[data-theme="dark"] {
  /* Automatically applied when background is dark */
}

[data-theme="light"] {
  /* Automatically applied when background is light */
}
```

## Accessibility Features

### Reduced Motion Support

- Automatically detects `prefers-reduced-motion: reduce`
- Disables smooth transitions when reduced motion is preferred
- Instant color switching maintains functionality without animation

### Color Contrast

- Automatic luminance calculation determines if background is dark/light
- CSS custom properties provide appropriate contrast colors
- `data-theme` attribute enables conditional styling

### Keyboard Navigation

- Background transitions don't interfere with keyboard navigation
- Fixed positioning with `pointer-events: none` prevents interaction blocking

## Performance Considerations

### Optimization Strategies

1. **Efficient Observers**: Uses single IntersectionObserver per section
2. **Transform-Only Animations**: Animates only `backgroundColor` property
3. **Dynamic Import**: Component loaded only on client-side
4. **Minimal Reflows**: Fixed positioning prevents layout shifts

### Bundle Size Impact

- Core component: ~2KB gzipped
- Dependencies: Framer Motion (already in project)
- No additional external dependencies

## Testing

### Unit Tests

Located in `__tests__/BackgroundColorSwitcher.test.tsx`:

- Component rendering and initialization
- IntersectionObserver setup and cleanup
- Threshold-based color switching
- CSS custom property updates
- Error handling for missing sections

### Manual Testing Checklist

- [ ] Smooth transition from white to black when scrolling from Projects to FAQ
- [ ] Smooth transition from black to white when scrolling up
- [ ] Respects prefers-reduced-motion (instant switching)
- [ ] Works with different viewport sizes
- [ ] No layout shifts or performance issues
- [ ] Proper contrast maintained throughout transitions

## Extending the System

### Adding New Sections

1. Add `data-section-id` to the new section:
```tsx
<section data-section-id="NewSection">
```

2. Add target configuration:
```tsx
{
  id: "NewSection",
  color: "#ff0000",
  threshold: 0.4,
}
```

### Custom Animation Easing

```tsx
// Use any Framer Motion easing
animationEasing="spring(1, 0.8, 0.3)"
animationEasing="circOut"
animationEasing=[0.25, 0.1, 0.25, 1] // Custom cubic-bezier
```

### Multiple Color Schemes

```tsx
// Different colors for different sections
const targets = [
  { id: "hero", color: "#000000" },
  { id: "projects", color: "#ffffff" },
  { id: "about", color: "#f3f4f6" },
  { id: "contact", color: "#1f2937" },
];
```

## Troubleshooting

### Common Issues

**Background not changing:**
- Verify `data-section-id` matches target `id`
- Check section is large enough to trigger threshold
- Ensure IntersectionObserver is supported (modern browsers)

**Jerky animations:**
- Reduce `animationDuration` for snappier transitions
- Check for competing CSS transitions on body/html
- Verify `will-change: backgroundColor` is applied

**SEO concerns:**
- Background animations don't affect SEO (content remains server-rendered)
- Default background color provides fallback for non-JS environments
- Structured data and meta tags unaffected

### Browser Support

- **Modern browsers**: Full support with smooth animations
- **Legacy browsers**: Graceful fallback to instant color switching
- **No JavaScript**: Default background color maintained

## Migration Notes

### From Static Backgrounds

1. Remove fixed background colors from sections
2. Add `data-section-id` attributes
3. Import and configure BackgroundColorSwitcher
4. Test transitions and adjust thresholds as needed

### Performance Monitoring

Monitor these metrics after implementation:
- First Contentful Paint (should be unaffected)
- Cumulative Layout Shift (should remain 0)
- Interaction to Next Paint (smooth scroll performance)

## Future Enhancements

### Potential Improvements

1. **Gradient Transitions**: Support for gradient backgrounds
2. **Multiple Triggers**: Multiple sections per color zone
3. **Scroll-Linked Animations**: Tie transition progress to scroll position
4. **Theme Integration**: Integration with system dark/light mode

### API Extensions

```typescript
// Future API ideas
interface AdvancedTarget {
  id: string;
  colors: {
    background: string;
    foreground: string;
    accent: string;
  };
  animation: {
    type: 'instant' | 'fade' | 'slide' | 'gradient';
    duration: number;
    easing: string;
  };
  responsive: {
    mobile: Partial<AdvancedTarget>;
    tablet: Partial<AdvancedTarget>;
  };
}
```