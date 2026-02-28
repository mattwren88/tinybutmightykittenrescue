# Mega Menu Design

## Problem
The nav has 10 top-level links that spill onto a second row on desktop. Needs to be reorganized into a cleaner mega menu.

## Design

### Groupings

| Our Cats       | Programs        | Get Involved |
|----------------|-----------------|--------------|
| Adopt          | Spay / Neuter   | Volunteer    |
| Favourites     | Feed A Feral    | FAQ          |
| Lotto for Cats | Empties         | Contact      |
|                | Emergency Kit   |              |

Plus: Logo (links home), standalone Donate button.

### Desktop (>768px)
- Top bar: `[Logo] Our Cats | Programs | Get Involved [Donate btn]`
- Hover/click a group label to reveal a dropdown panel
- White panel with subtle shadow, purple accent on link hover
- Only one panel open at a time
- Clicking outside closes the open panel

### Mobile (<768px)
- Hamburger icon opens menu
- Three groups shown as collapsible accordion sections
- Tap group label to expand/collapse its links
- Donate button stays prominent at bottom of mobile menu

### Behavior
- Active page: link inside dropdown gets active style, parent group label gets subtle indicator
- Pure CSS `:hover` + `:focus-within` for desktop dropdowns
- JS for: mobile accordion toggle, outside-click-to-close, aria attributes

### Files to modify
- Nav HTML in all 12 `index.html` pages (new grouped nav structure)
- `docs/css/style.css` — mega menu styles replacing flat nav styles
- `docs/js/main.js` — updated hamburger logic for accordion groups + outside-click

### Content management (future)
- Google Sheets/Docs as lightweight CMS for the rescue owner
- She edits content in familiar tools, a build script regenerates HTML
- Separate design/plan to follow
