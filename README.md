# React Guide

A lightweight, customizable React tour/guide library for creating interactive product tours and onboarding experiences.

## Features

- **Spotlight Effect** - Highlights target elements with a dark overlay
- **Smart Positioning** - Automatically positions tooltips for optimal viewing (8 positions + auto)
- **Multiple Highlights** - Highlight multiple elements simultaneously
- **Cross-Page Tours** - Navigate across different routes during a tour
- **Smooth Animations** - Beautiful transitions between steps
- **Click Control** - Option to disable clicks on highlighted elements
- **Custom Actions** - Execute custom functions on navigation
- **Fully Customizable** - Custom button labels, callbacks, and positioning

## Installation

```bash
npm install react-guide
```

or

```bash
yarn add react-guide
```

## Quick Start

```jsx
import { ReactGuide } from 'react-guide'
import { useState } from 'react'

const steps = [
  {
    step: 1,
    id: 'welcome-button',
    title: 'Welcome!',
    content: 'Click here to get started with our app.'
  },
  {
    step: 2,
    id: 'feature-section',
    title: 'Features',
    content: 'Explore all the amazing features we offer.'
  }
]

function App() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Start Tour</button>

      <ReactGuide
        steps={steps}
        isOpen={isOpen}
        onComplete={() => setIsOpen(false)}
        onSkip={() => setIsOpen(false)}
      />
    </>
  )
}
```

## Step Configuration

Each step can have the following properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `step` | number | Yes | Step order number |
| `id` | string | No* | Target element ID |
| `className` | string | No* | Target element class name |
| `targets` | array | No* | Array of multiple targets `[{ id, className }]` |
| `title` | string | No | Tooltip title |
| `content` | string | Yes | Tooltip content/description |
| `position` | string | No | Tooltip position (see positions below) |
| `path` | string | No | Route path for cross-page tours |
| `nextPath` | string | No | Path to navigate when clicking Next |
| `onNext` | function | No | Custom function to run on Next click |
| `nextLabel` | string | No | Custom label for Next button |

*At least one of `id`, `className`, or `targets` is required.

## Tooltip Positions

The `position` property supports:

- `'auto'` (default) - Automatically determines best position
- `'top'` - Above the target, centered
- `'bottom'` - Below the target, centered
- `'left'` - Left of the target, centered
- `'right'` - Right of the target, centered
- `'top-left'` - Above the target, aligned left
- `'top-right'` - Above the target, aligned right
- `'bottom-left'` - Below the target, aligned left
- `'bottom-right'` - Below the target, aligned right

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `steps` | array | `[]` | Array of step configurations |
| `isOpen` | boolean | `false` | Whether the tour is active |
| `isClickDisabled` | boolean | `false` | Disable clicks on highlighted elements |
| `onComplete` | function | - | Called when tour completes |
| `onSkip` | function | - | Called when tour is skipped |
| `onStepChange` | function | - | Called on step change `(stepNumber, path)` |
| `onNavigate` | function | - | Called for page navigation `(path)` |

## Advanced Examples

### Multiple Highlights

Highlight multiple elements at once:

```jsx
const steps = [
  {
    step: 1,
    targets: [
      { id: 'header' },
      { id: 'sidebar' }
    ],
    title: 'Navigation',
    content: 'These are the main navigation areas.'
  }
]
```

### Cross-Page Tours

Create tours that span multiple pages:

```jsx
import { useNavigate } from 'react-router-dom'

function App() {
  const navigate = useNavigate()

  const steps = [
    {
      step: 1,
      path: '/',
      id: 'home-feature',
      content: 'Welcome to home page!'
    },
    {
      step: 2,
      path: '/about',
      id: 'about-section',
      content: 'Now we are on the about page!'
    }
  ]

  return (
    <ReactGuide
      steps={steps}
      isOpen={isOpen}
      onNavigate={(path) => navigate(path)}
      onComplete={() => setIsOpen(false)}
    />
  )
}
```

### Custom Next Button Actions

Execute custom code when clicking Next:

```jsx
const steps = [
  {
    step: 1,
    id: 'signup-form',
    content: 'Fill out this form',
    nextLabel: 'Submit & Continue',
    onNext: () => {
      // Submit form, track analytics, etc.
      console.log('Form submitted!')
    }
  }
]
```

### Disable Clicking on Highlighted Elements

Prevent users from interacting with highlighted elements:

```jsx
<ReactGuide
  steps={steps}
  isOpen={isOpen}
  isClickDisabled={true}
  onComplete={() => setIsOpen(false)}
/>
```

### Force Specific Position

Override automatic positioning:

```jsx
const steps = [
  {
    step: 1,
    id: 'bottom-element',
    content: 'This tooltip will appear on top',
    position: 'top'
  }
]
```

## Styling

The component comes with built-in styles. The tooltip uses a clean, modern design with:

- White background with rounded corners
- Subtle shadow for depth
- Blue accent color for buttons and highlights
- Smooth animations and transitions

## Browser Support

React Guide works in all modern browsers:

- Chrome
- Firefox
- Safari
- Edge

## Requirements

- React >= 16.8.0 (hooks support)
- React DOM >= 16.8.0

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
