# Theme Update Guide

## ✅ Completed Screens:
1. **Auth Screens:**
   - `/app/auth/index.tsx` ✅
   - `/app/auth/signin.tsx` ✅
   - `/app/auth/signup.tsx` ✅
   - `/app/auth/forgot-password.tsx` ✅

2. **Main Tab Screens:**
   - `/app/(tabs)/index.tsx` (Home) ✅
   - `/app/(tabs)/calendar.tsx` ✅
   - `/app/(tabs)/family.tsx` ✅
   - `/app/(tabs)/_layout.tsx` (Tab Bar) ✅

3. **Other Screens:**
   - `/app/schools.tsx` ✅ (partially - needs color constants)

## 🔄 Screens That Need Updates:

### Tab Screens:
- `/app/(tabs)/photos.tsx`
- `/app/(tabs)/more.tsx`

### Schedule Screens:
- `/app/today-schedule.tsx`
- `/app/week-schedule.tsx`

### Settings Screens:
- `/app/settings.tsx`
- `/app/profile-settings.tsx`
- `/app/notification-settings.tsx`

### Form Screens:
- `/app/add-family-member.tsx`
- `/app/create-school-event.tsx`

### Detail Screens:
- `/app/event-detail/[id].tsx`
- `/app/member-detail/[id].tsx`
- `/app/schedule-detail/[id].tsx`
- `/app/album-detail/[id].tsx`

### Other Screens:
- `/app/gallery.tsx`
- `/app/schools-new.tsx`
- `/app/index.tsx`

## Pattern to Apply:

### Step 1: Add Import
```typescript
import { COLORS, SHADOWS } from '@/theme/colors';
```

### Step 2: Replace Color Values

| Old Value | New Value |
|-----------|-----------|
| `backgroundColor: '#F9FAFB',` | `backgroundColor: COLORS.background,` |
| `backgroundColor: '#FFFFFF',` | `backgroundColor: COLORS.cardBackground,` |
| `backgroundColor: '#0e3c67',` | `backgroundColor: COLORS.primary,` |
| `backgroundColor: '#F3F4F6',` | `backgroundColor: COLORS.secondaryBackground,` |
| `backgroundColor: '#F8FAFC',` | `backgroundColor: COLORS.secondaryBackground,` |
| `color: '#111827',` | `color: COLORS.textPrimary,` |
| `color: '#FFFFFF',` | `color: COLORS.textPrimary,` |
| `color: '#6B7280',` | `color: COLORS.textSecondary,` |
| `color: '#374151',` | `color: COLORS.textPrimary,` |
| `color: '#0e3c67',` | `color: COLORS.primary,` |
| `borderColor: '#E5E7EB',` | `borderColor: COLORS.border,` |
| `borderColor: '#D1D5DB',` | `borderColor: COLORS.inputBorder,` |

### Step 3: Update Shadow Styles
Replace old shadow patterns:
```typescript
// Old
shadowColor: '#0e3c67',
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.2,
shadowRadius: 8,
elevation: 4,

// New
...SHADOWS.glow(COLORS.primary),
```

## Quick Command Pattern:

For each file:
1. Add theme import after other imports
2. Use find/replace with `replace_all: true` for each color pattern
3. Update inline color values in JSX (e.g., `color="#0e3c67"` → `color={COLORS.primary}`)

## Theme Colors Reference:

```typescript
COLORS = {
  primary: '#0E3C67',           // Main accent color
  accent: '#FFB84C',            // Secondary accent (yellow)
  background: '#0A1E33',        // Main background
  secondaryBackground: '#102C4A', // Lighter sections
  cardBackground: '#133A63',    // Cards and modals
  textPrimary: '#FFFFFF',       // Main text
  textSecondary: '#BFD1E5',     // Muted text
  border: '#1C4A78',            // Dividers/borders
  inputBackground: '#0A1E33',   // Input fields
  inputBorder: '#1C4A78',       // Input borders
}
```
