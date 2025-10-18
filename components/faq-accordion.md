# FAQ Accordion Component

## Overview
A reusable, accessible accordion component for displaying FAQs with smooth animations and full customization support.

## Features
- ✅ **Fully Accessible** - Proper ARIA attributes and keyboard navigation
- ✅ **Customizable Styling** - Supports custom classes for all elements
- ✅ **Animation Support** - Smooth expand/collapse with Framer Motion
- ✅ **Flexible Content** - Accepts both string and React node answers
- ✅ **TypeScript Support** - Full type safety with detailed interfaces

## Usage

### Basic Usage
```tsx
import { FaqAccordion } from "@/components/faq-accordion";
import { FAQ_DATA } from "@/constants/faq-data";

function MyComponent() {
  return <FaqAccordion faqs={FAQ_DATA} />;
}
```

### Custom Styling
```tsx
<FaqAccordion
  faqs={FAQ_DATA}
  className="my-custom-wrapper"
  questionClassName="text-blue-600 font-bold"
  answerClassName="text-gray-700"
  iconClassName="text-blue-400"
  borderClassName="border-blue-300"
/>
```

### Custom Animation Timing
```tsx
<FaqAccordion
  faqs={FAQ_DATA}
  animationDelay={0.1}
  animationDuration={0.8}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `faqs` | `FaqItem[]` | **Required** | Array of FAQ items |
| `className` | `string` | `""` | Additional classes for container |
| `itemClassName` | `string` | `""` | Additional classes for each item |
| `questionClassName` | `string` | `"text-white..."` | Classes for questions |
| `answerClassName` | `string` | `"text-gray-400..."` | Classes for answers |
| `iconClassName` | `string` | `"text-gray-400"` | Classes for expand icon |
| `borderClassName` | `string` | `"border-primary/50"` | Classes for borders |
| `animationDelay` | `number` | `0.05` | Stagger delay (seconds) |
| `animationDuration` | `number` | `0.6` | Animation duration (seconds) |

## Types

### FaqItem
```typescript
interface FaqItem {
  question: string;
  answer: string | React.ReactNode;
}
```

### FaqAccordionProps
```typescript
interface FaqAccordionProps {
  faqs: FaqItem[];
  className?: string;
  itemClassName?: string;
  questionClassName?: string;
  answerClassName?: string;
  iconClassName?: string;
  borderClassName?: string;
  animationDelay?: number;
  animationDuration?: number;
}
```

## Data Structure

FAQ data is centralized in `/constants/faq-data.tsx`:

```tsx
export const FAQ_DATA: FaqItem[] = [
  {
    question: "YOUR QUESTION?",
    answer: "Your answer text or React component",
  },
  // ... more items
];
```

## File Structure

```
components/
├── faq-accordion.tsx       # Main component
├── index.ts                # Barrel exports

constants/
├── faq-data.tsx            # FAQ data
├── index.ts                # Barrel exports

sections/
├── faq.tsx                 # Standalone FAQ section
├── combined-projects-faq.tsx  # Combined section
```

## Best Practices

1. **Centralized Data** - FAQ data is stored in `/constants/faq-data.tsx` for easy maintenance
2. **Type Safety** - All props and data structures are fully typed
3. **Reusability** - Component can be used across multiple sections
4. **Accessibility** - Proper ARIA attributes and keyboard support
5. **Performance** - Animations optimized with Framer Motion
6. **Customization** - Every visual aspect can be customized via props

## Examples

### With Custom Answer Component
```tsx
const customFaqs: FaqItem[] = [
  {
    question: "CUSTOM QUESTION?",
    answer: (
      <div>
        <p>Rich content with:</p>
        <ul>
          <li>Lists</li>
          <li>Links</li>
          <li>Images</li>
        </ul>
      </div>
    ),
  },
];
```

### Dark Theme Example
```tsx
<FaqAccordion
  faqs={FAQ_DATA}
  questionClassName="text-white"
  answerClassName="text-gray-300"
  borderClassName="border-white/20"
  iconClassName="text-white/60"
/>
```

### Light Theme Example
```tsx
<FaqAccordion
  faqs={FAQ_DATA}
  questionClassName="text-gray-900"
  answerClassName="text-gray-600"
  borderClassName="border-gray-200"
  iconClassName="text-gray-400"
/>
```
