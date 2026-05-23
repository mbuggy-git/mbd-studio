# MBD Studio Design System

## Brand Colors

### Primary Colors
- **MBD Purple**: `#4b30b0` - Primary brand color used for headers, links, and primary actions
- **MBD Pink**: `#FF5DE4` - Secondary brand color used for portfolio links and accents
- **White**: `#ffffff` - Used for backgrounds and button text
- **Black/Dark**: `#030213` - Primary text color

### UI Colors (from CSS Variables)
- **Background**: `#ffffff` (light) / `oklch(0.145 0 0)` (dark)
- **Foreground**: `oklch(0.145 0 0)` (light) / `oklch(0.985 0 0)` (dark)
- **Muted**: `#ececf0` (light) / `oklch(0.269 0 0)` (dark)
- **Muted Foreground**: `#717182` (light) / `oklch(0.708 0 0)` (dark)
- **Border**: `rgba(0, 0, 0, 0.1)` (light) / `oklch(0.269 0 0)` (dark)
- **Card**: `#ffffff` (light) / `oklch(0.145 0 0)` (dark)

## Typography

### Font Family
- **Primary**: Montserrat (Google Fonts)
- **Weights Available**: 300, 400, 500, 600, 700, 800, 900

### Typography Scale
- **Base Font Size**: 14px
- **H1**: 2xl size, medium weight (500)
- **H2**: xl size, medium weight (500) 
- **H3**: lg size, medium weight (500)
- **H4**: base size, medium weight (500)
- **Body/P**: base size, normal weight (400)
- **Labels**: base size, medium weight (500)
- **Buttons**: base size, medium weight (500)

### Typography Usage
- **Channel Title**: Large, bold text in white on purple background
- **Video Titles**: Bold for better readability
- **Subscribe Link**: Bold, purple (#4b30b0), underlined
- **Body Text**: Regular weight, muted color for descriptions

## Component Styles

### Buttons

#### Primary Button Style
```css
background: white
color: #4b30b0
padding: 12px 24px
border-radius: 8px
font-weight: medium
transition: all 200ms

hover:
  background: #4b30b0
  color: white
  outline: 4px solid white
```

#### Secondary Button (Pink/Portfolio)
```css
background: #FF5DE4
color: white
padding: 12px 24px
border-radius: 8px
font-weight: medium
transition: all 200ms

hover:
  background: white
  color: #FF5DE4
  outline: 4px solid #FF5DE4
```

### Cards (Video Cards)
```css
background: white
border-radius: 8px
overflow: hidden
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1)
transition: transform 200ms
cursor: pointer

hover:
  transform: translateY(-2px)
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)
```

### Images
- **Avatar/Profile**: Circular with white border (4px) and shadow
- **Video Thumbnails**: 16:9 aspect ratio, rounded corners
- **Personal Photo**: Large circular (192px on desktop), white border, shadow

### Header Section
```css
background: #4b30b0
color: white
padding: 32px
border-radius: 8px
margin-bottom: 32px

layout: flex (responsive)
gap: 24px
```

## Spacing System

### Standard Spacing
- **xs**: 4px
- **sm**: 8px  
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px
- **3xl**: 64px

### Component Spacing
- **Card Padding**: 16px
- **Button Padding**: 12px 24px
- **Header Padding**: 32px
- **Grid Gap**: 24px
- **Section Margin**: 32px

## Layout Patterns

### Grid System
- **Video Grid**: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop)
- **Max Width**: 7xl (1280px)
- **Container Padding**: 24px

### Responsive Breakpoints
- **Mobile**: Default
- **Tablet**: md (768px+)
- **Desktop**: lg (1024px+)

## Interactive States

### Hover Effects
- **Cards**: Slight lift (-2px transform) + enhanced shadow
- **Buttons**: Color inversion + outline
- **Links**: Opacity reduction (80%)

### Focus States
- **Ring Color**: `oklch(0.708 0 0)`
- **Ring Offset**: 2px

## Icons
- **Library**: Lucide React
- **Size**: 16px (w-4 h-4) standard
- **Color**: Inherits from text color

## Animation
- **Duration**: 200ms standard
- **Easing**: ease-in-out (CSS default)
- **Properties**: transform, background-color, color, box-shadow, opacity

## Accessibility

### Color Contrast
- All text meets WCAG AA standards
- White text on #4b30b0 background: High contrast
- #4b30b0 text on white background: High contrast

### Interactive Elements
- All buttons have focus states
- Keyboard navigation support
- Screen reader friendly alt text

## Usage Guidelines

### Color Usage
- Use **MBD Purple** (#4b30b0) for primary actions and brand elements
- Use **MBD Pink** (#FF5DE4) sparingly for special highlights (portfolio)
- Maintain high contrast for readability
- Use white for primary button text on colored backgrounds

### Typography Guidelines
- Use **Montserrat** consistently across all text
- **Bold** video titles and important links for hierarchy
- Keep body text at regular weight for readability
- Use medium weight (500) for headings and labels

### Component Guidelines
- Maintain consistent border radius (8px) across cards and buttons
- Use consistent spacing (24px gaps, 32px sections)
- Apply hover effects for interactive feedback
- Keep shadows subtle for depth without distraction

This design system ensures consistency across all MBD Studio brand materials and provides a solid foundation for creating a comprehensive Figma library.