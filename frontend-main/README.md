# Musngr

---

# Project Design Language Documentation

## **1. UI Library**

This project leverages **[Shadcn/UI](https://ui.shadcn.com/)** as the primary UI library. All components have been designed in **Figma** and align with the tokens provided by Shadcn/UI for consistency.

---

## **2. Fonts**

- **Primary Font**: [CalSans](https://github.com/ibm/CalSans)  
  This modern, sans-serif font is used for all text across the application for a clean and elegant design.

---

## **3. Color Scheme**

The project uses a **Neutral palette** for its primary colors. Below is the color scale applied:

| Color Name  | Hex Code  | Token         |
|-------------|-----------|---------------|
| **Neutral-50**  | `#FAFAFA` | `neutral-50` |
| **Neutral-100** | `#F5F5F5` | `neutral-100` |
| **Neutral-200** | `#E5E5E5` | `neutral-200` |
| **Neutral-300** | `#D4D4D4` | `neutral-300` |
| **Neutral-400** | `#A3A3A3` | `neutral-400` |
| **Neutral-500** | `#737373` | `neutral-500` |
| **Neutral-600** | `#525252` | `neutral-600` |
| **Neutral-700** | `#404040` | `neutral-700` |
| **Neutral-800** | `#262626` | `neutral-800` |
| **Neutral-900** | `#171717` | `neutral-900` |
| **Neutral-950** | `#0F0F0F` | `neutral-950` |

These colors follow a **monochromatic scheme**, with lighter shades used for backgrounds and darker shades for text or UI elements.

---

## **4. Typography**

The project uses a modular typography system for readability and responsiveness. The details are as follows:

| **Element**         | **Font Size** | **Line Height** |
|----------------------|---------------|-----------------|
| **Display (H1)**     | 40px (5xl)    | 48px            |
| **Heading 1 (H1)**   | 36px (4xl)    | 44px            |
| **Heading 2 (H2)**   | 30px (3xl)    | 40px            |
| **Heading 3 (H3)**   | 24px (2xl)    | 32px            |
| **Body (Base Text)** | 16px (base)   | 24px            |
| **Caption**          | 14px (sm)     | 20px            |
| **Small Text**       | 12px (xs)     | 16px            |

---

## **5. Sizes**

Sizes for components align directly with **Shadcn/UI's default tokens** for consistency in spacing, typography, and responsiveness. Below are the main size definitions:

### **Spacing (Margin/Padding/Gaps)**

| Size Name | Pixel Value |
|-----------|-------------|
| **Small** | `4px`       |
| **Medium**| `8px`       |
| **Large** | `16px`      |
| **Extra Large** | `24px` |
| **Section Gaps** | `32px` |

### **Container Widths**

| Token    | Width        |
|----------|--------------|
| `sm`     | 640px        |
| `md`     | 768px        |
| `lg`     | 1024px       |
| `xl`     | 1280px       |
| `2xl`    | 1536px       |

### **Radius (Border Radius)**

| Token    | Value   |
|----------|---------|
| `sm`     | 4px     |
| `md`     | 8px     |
| `lg`     | 12px    |
| `full`   | 9999px  |

### **Button Sizes**

| Button Size | Padding       | Font Size |
|-------------|---------------|-----------|
| `Small`     | `8px x 12px`  | 14px      |
| `Medium`    | `10px x 16px` | 16px      |
| `Large`     | `12px x 20px` | 18px      |

---

## **6. Animations**

Animations add an interactive and seamless user experience. The following principles guide the animations:

- **Smoothness**: Utilize Shadcn/UI's built-in transitions and timing functions for consistent effects.
- **Default Easing**: `ease-in-out`
- **Timing**: `150ms` for standard transitions, `300ms` for more complex interactions.
- **Examples**:
  - Button Hover: `scale(1.05)` with a `150ms` transition.
  - Modal Animations: `fade-in` with `opacity` and `translateY(20px)` over `300ms`.

Animations are lightweight, ensuring high performance while maintaining accessibility.

---

## **7. Customizations**

To modify or extend these defaults, utilize the **TailwindCSS theme extension** in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0F0F0F',
        },
      },
      spacing: {
        18: '4.5rem', // Add custom spacing if needed
      },
      borderRadius: {
        xl: '1rem',
      },
    },
  },
};
```
