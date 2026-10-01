Refactor notes - Kanban UI

What changed:

- Replaced local Kanban styles to use global CSS variables (generated from `src/utils/getColorPalette.ts`) so brand colors apply automatically.
- Updated `src/utils/getColorPalette.ts` to export `getCssVariables` helper (not mandatory) and ensure consistent palette.
- Refactored `src/screens/Kanban/styles/kanban.css` to rely on CSS variables for colors, rounded corners, and consistent spacing.
- Updated `src/screens/Kanban/components/TaskItems.tsx` to use CSS variables and consistent typography/spacing. Reduced inline Tailwind-like classes and used explicit styles for clarity.
- Small header typography adjustment in `Kanban.tsx`.

Follow-ups / recommendations:

- Consider moving any remaining inline styles into the CSS file or Tailwind utility classes for consistency.
- Add a few visual tests or Storybook snapshots for Kanban columns/cards to guard regressions.
- Review mobile responsiveness for narrow screens; column sizes may need to become fully fluid or stack.

Files edited:

- src/utils/getColorPalette.ts
- src/screens/Kanban/styles/kanban.css
- src/screens/Kanban/components/TaskItems.tsx
- src/screens/Kanban/Kanban.tsx

Verification:

- `generateCssVariables()` runs at app startup (see `src/index.tsx`) so CSS variables are available globally.
- Run the app locally (e.g., `npm start` or `npm run start:development`) and navigate to the Kanban screen to visually verify colors/spacing.
