# UI/UX System

## Visual direction

PowerChain Relief uses a light institutional theme by default with dark mode as a secondary preference.

- white/light-gray operational surfaces;
- forest-green actions;
- white text on primary green buttons;
- restrained theme-aware frames;
- soft elevation rather than glossy shadows;
- no neon, gradient hype or token-terminal aesthetics.

## Responsive breakpoints

- mobile: 640 px;
- tablet: 980 px;
- desktop content target: 1180 px.

## Motion

Framer Motion is used only for hierarchy and continuity:

- section reveal: subtle opacity + 8–14 px vertical translation;
- card hover: maximum 2 px lift;
- dashboard entry: opacity only;
- no infinite decorative animation;
- `prefers-reduced-motion` disables movement.

Animation must not be required to understand state.

## Status semantics

Green: operational/verified  
Amber: degraded/review  
Red: failed/high priority  
Gray: neutral/unconfigured

Color is always paired with text or iconography.
