# 🎨 Design System - Hospitality Hub Platform

## 📋 Overview
This document extracts and standardizes the design system from the existing Liquor Inventory App for use across the Hospitality Hub Platform.

---

## 🎨 Color Palette

### Primary Colors
```css
/* Primary Brand Colors */
--primary-black: #000000          /* Main brand color, buttons, text */
--primary-slate-900: #0f172a      /* Headings, important text */
--primary-slate-800: #1e293b      /* Secondary headings */
--primary-slate-700: #334155      /* Body text, links */
--primary-slate-600: #475569      /* Secondary text */
--primary-slate-500: #64748b      /* Muted text */
--primary-slate-300: #cbd5e1      /* Borders, dividers */
--primary-slate-50: #f8fafc       /* Light backgrounds */

/* Blue Accent Colors */
--accent-blue-600: #2563eb        /* Primary accent, CTAs */
--accent-blue-500: #3b82f6        /* Secondary accent */
--accent-blue-400: #60a5fa        /* Tertiary accent */
--accent-blue-100: #dbeafe        /* Light blue backgrounds */
--accent-blue-50: #eff6ff         /* Very light blue backgrounds */

/* Green Success Colors */
--success-green-500: #10b981      /* Success states, checkmarks */
--success-green-100: #d1fae5      /* Success backgrounds */

/* Background Gradients */
--gradient-primary: linear-gradient(to bottom right, #f8fafc, #dbeafe, #eff6ff)
--gradient-card: linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.6))
```

### Color Usage Patterns
- **Primary Actions**: `bg-black hover:bg-slate-800`
- **Secondary Actions**: `border-2 border-slate-300 text-slate-700 hover:bg-slate-50`
- **Accent Elements**: `bg-blue-600 text-white`
- **Success States**: `text-green-500` or `bg-green-100`
- **Text Hierarchy**: 
  - Headings: `text-slate-900`
  - Body: `text-slate-700`
  - Muted: `text-slate-600`
  - Subtle: `text-slate-500`

---

## 🏗️ Layout & Spacing

### Container Patterns
```css
/* Main Container */
.max-w-7xl mx-auto px-4 sm:px-6 lg:px-8

/* Card Container */
.bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20

/* Section Spacing */
.pt-24 pb-16  /* Hero sections */
.py-16        /* Standard sections */
.p-6          /* Card padding */
```

### Grid Systems
```css
/* Two Column Layout */
.grid lg:grid-cols-2 gap-12 items-center

/* Card Grid */
.grid grid-cols-2 gap-4

/* Responsive Grid */
.grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
```

---

## 🎭 Glassmorphic Effects

### Core Glassmorphic Pattern
```css
/* Primary Glassmorphic Card */
.bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20

/* Navigation Glassmorphic */
.bg-white/10 backdrop-blur-xl border-b border-white/20

/* Floating Card Effect */
.bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 animate-float
```

### Animation Classes
```css
/* Floating Animation */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-float-delay {
  animation: float 3s ease-in-out infinite 1.5s;
}

/* Scroll Animations */
@keyframes scroll-up {
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}

.animate-scroll-up {
  animation: scroll-up 20s linear infinite;
}
```

---

## 🔘 Component Patterns

### Buttons
```css
/* Primary Button */
.bg-black hover:bg-slate-800 text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 hover:shadow-lg

/* Secondary Button */
.border-2 border-slate-300 text-slate-700 px-6 py-2 rounded-xl font-medium hover:bg-slate-50 transition-colors

/* Large CTA Button */
.bg-black hover:bg-slate-800 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 hover:shadow-xl

/* Icon Button */
.p-1 rounded-lg hover:bg-blue-50 text-slate-600 hover:text-slate-800 transition-colors
```

### Cards
```css
/* Feature Card */
.bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20

/* Icon Card */
.w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center

/* Stats Card */
.bg-white rounded-xl p-6 shadow-lg border border-slate-200
```

### Navigation
```css
/* Sidebar */
.bg-white border-r border-blue-200 shadow-lg

/* Nav Links */
.text-slate-700 hover:text-slate-900 transition-colors font-medium

/* Active State */
.bg-blue-50 text-blue-700 border-r-2 border-blue-600
```

---

## 📱 Responsive Design

### Breakpoint Strategy
```css
/* Mobile First Approach */
/* Base styles (mobile) */
.text-sm
.p-4

/* Small screens and up */
sm:text-base sm:px-6

/* Medium screens and up */
md:flex md:items-center md:gap-8

/* Large screens and up */
lg:grid lg:grid-cols-2 lg:gap-12

/* Extra large screens */
xl:max-w-7xl
```

### Mobile Patterns
```css
/* Mobile Menu Button */
.fixed top-4 left-4 z-50 lg:hidden bg-white border border-blue-200 rounded-lg p-3

/* Mobile Navigation */
.hidden md:flex  /* Hide on mobile, show on desktop */
.lg:hidden       /* Show on mobile, hide on desktop */
```

---

## 🔤 Typography

### Font Stack
```css
/* Primary Font */
font-family: Arial, Helvetica, sans-serif

/* Tailwind Font Classes */
.font-bold      /* Headings */
.font-semibold  /* Subheadings */
.font-medium    /* Navigation, buttons */
.text-lg        /* Large text */
.text-xl        /* Extra large text */
.text-5xl       /* Hero headings */
```

### Text Hierarchy
```css
/* Hero Heading */
.text-5xl lg:text-6xl font-bold text-slate-900 leading-tight

/* Section Heading */
.text-3xl font-bold text-slate-900

/* Card Heading */
.font-semibold text-slate-900 mb-2

/* Body Text */
.text-xl text-slate-600 leading-relaxed

/* Small Text */
.text-sm text-slate-500
```

---

## 🎯 Interactive States

### Hover Effects
```css
/* Button Hover */
.hover:bg-slate-800 hover:shadow-lg transition-all duration-200

/* Link Hover */
.hover:text-slate-900 transition-colors

/* Card Hover */
.hover:shadow-xl transition-all duration-200

/* Icon Hover */
.hover:translate-x-1 transition-transform
```

### Focus States
```css
/* Focus Ring */
.focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2

/* Focus Visible */
.focus-visible:ring-2 focus-visible:ring-blue-500
```

---

## 🎨 Icon System

### Icon Sizes
```css
/* Small Icons */
.w-4 h-4

/* Medium Icons */
.w-5 h-5

/* Large Icons */
.w-6 h-6

/* Extra Large Icons */
.w-8 h-8

/* Hero Icons */
.w-12 h-12
```

### Icon Colors
```css
/* Primary Icons */
.text-slate-700

/* Accent Icons */
.text-blue-600

/* Success Icons */
.text-green-500

/* White Icons */
.text-white
```

---

## 📐 Spacing Scale

### Padding & Margins
```css
/* Tiny */
.p-1 .m-1

/* Small */
.p-2 .m-2

/* Medium */
.p-4 .m-4

/* Large */
.p-6 .m-6

/* Extra Large */
.p-8 .m-8

/* Hero Spacing */
.pt-24 pb-16
```

### Gaps
```css
/* Small Gap */
.gap-2

/* Medium Gap */
.gap-4

/* Large Gap */
.gap-6

/* Extra Large Gap */
.gap-8

/* Hero Gap */
.gap-12
```

---

## 🎭 Animation & Transitions

### Transition Durations
```css
/* Fast */
.transition-colors

/* Medium */
.transition-all duration-200

/* Slow */
.transition-all duration-300
```

### Animation Patterns
```css
/* Float Animation */
.animate-float

/* Scroll Animation */
.animate-scroll-up

/* Transform Animations */
.group-hover:translate-x-1
.hover:scale-105
```

---

## 📱 Component Inventory

### Core Components
- **DashboardSidebar**: Collapsible navigation with glassmorphic design
- **Modal**: Overlay dialogs with backdrop blur
- **EnhancedNavigation**: Top navigation with glassmorphic effects

### App Components
- **InventoryTable**: Data tables with sorting and filtering
- **AddItemModal**: Form modals for data entry
- **EditItemModal**: Edit forms with validation
- **RoomManager**: Room management interface
- **SupplierManager**: Supplier CRUD operations

### Feature Components
- **BarcodeScanner**: Mobile scanning interface
- **RoomCountingInterface**: Real-time counting UI
- **ImportData**: CSV import functionality
- **ActivityDashboard**: Analytics and reporting

### Admin Components
- **AdminDashboard**: Admin overview and controls
- **UserAnalytics**: User behavior analytics
- **RevenueAnalytics**: Financial reporting
- **DataExport**: Export functionality
- **AdminSettings**: System configuration

### Integration Components
- **QuickBooksIntegration**: Accounting integration
- **SubscriptionManager**: Billing management

### Reporting Components
- **OrderReport**: Order analytics
- **EnhancedReports**: Advanced reporting
- **AdvancedReporting**: Custom report builder

### User Management
- **UserPermissions**: Role and permission management

---

## 🚀 Implementation Guidelines

### 1. Color Usage
- Always use the defined color palette
- Maintain consistent contrast ratios
- Use semantic colors (success, error, warning)

### 2. Component Development
- Follow the established patterns
- Maintain glassmorphic effects consistently
- Ensure responsive design from mobile up

### 3. Animation Guidelines
- Keep animations subtle and purposeful
- Use consistent timing (200ms, 300ms)
- Ensure animations don't interfere with usability

### 4. Accessibility
- Maintain proper contrast ratios
- Include focus states for all interactive elements
- Use semantic HTML structure

### 5. Performance
- Optimize glassmorphic effects for performance
- Use CSS transforms for animations
- Minimize layout shifts

---

## 📝 Notes for Platform Implementation

### Key Design Principles
1. **Consistency**: All apps should follow this design system
2. **Glassmorphism**: Maintain the modern glassmorphic aesthetic
3. **Responsive**: Mobile-first approach with progressive enhancement
4. **Accessibility**: WCAG 2.1 AA compliance
5. **Performance**: Optimized for fast loading and smooth interactions

### Migration Strategy
1. Extract all components to shared library
2. Standardize color tokens across platform
3. Implement consistent spacing and typography
4. Maintain glassmorphic effects in all apps
5. Ensure responsive design patterns

### Future Considerations
- Dark mode support
- High contrast mode
- Reduced motion preferences
- Internationalization (i18n) support
