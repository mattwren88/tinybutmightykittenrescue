# Mega Menu Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the flat 10-link nav with a grouped mega menu (3 dropdown categories + Donate button).

**Architecture:** Pure CSS dropdowns on desktop (`:hover` + `:focus-within`), JS accordion on mobile. No frameworks. Same vanilla HTML/CSS/JS approach as existing site.

**Tech Stack:** HTML, CSS, vanilla JS

---

### Task 1: Update CSS — Replace flat nav styles with mega menu styles

**Files:**
- Modify: `docs/css/style.css:67-148` (Header / Nav section)
- Modify: `docs/css/style.css:587-640` (Responsive section)

**Step 1: Replace the nav CSS (lines 67–148) with mega menu styles**

Replace the entire `/* --- Header / Nav --- */` section in `style.css` with:

```css
/* --- Header / Nav --- */
.site-header {
  background: var(--color-white);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--nav-height);
  gap: 1rem;
}

.nav__logo img {
  height: 40px;
  width: auto;
  border-radius: 50%;
}

/* --- Menu container (holds the 3 dropdown groups) --- */
.nav__menu {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* --- Each dropdown group --- */
.nav__group {
  position: relative;
}

.nav__group-label {
  font-family: var(--font-heading);
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.5rem 0.9rem;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s, color 0.2s;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: none;
  border: none;
}

.nav__group-label::after {
  content: '';
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid currentColor;
  transition: transform 0.2s;
}

.nav__group-label:hover,
.nav__group.has-active > .nav__group-label {
  background: var(--color-purple-light);
  color: var(--color-purple-dark);
}

/* --- Dropdown panel --- */
.nav__dropdown {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 180px;
  background: var(--color-white);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
  padding: 0.5rem 0;
  z-index: 200;
}

/* Show on hover or focus-within (desktop) */
.nav__group:hover > .nav__dropdown,
.nav__group:focus-within > .nav__dropdown {
  display: block;
}

.nav__group:hover > .nav__group-label::after,
.nav__group:focus-within > .nav__group-label::after {
  transform: rotate(180deg);
}

/* --- Links inside dropdown --- */
.nav__dropdown a {
  display: block;
  font-family: var(--font-heading);
  font-size: 0.82rem;
  font-weight: 600;
  padding: 0.55rem 1.2rem;
  color: var(--color-text);
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;
}

.nav__dropdown a:hover,
.nav__dropdown a.active {
  background: var(--color-purple-light);
  color: var(--color-purple-dark);
}

/* --- Donate button (standalone) --- */
.nav__donate {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 0.85rem;
  background: var(--color-orange);
  color: var(--color-white) !important;
  padding: 0.5rem 1.2rem;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: background 0.2s;
  white-space: nowrap;
}

.nav__donate:hover {
  background: var(--color-orange-hover);
  color: var(--color-white) !important;
}

/* --- Hamburger (hidden on desktop) --- */
.nav__hamburger {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.nav__hamburger span {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--color-text);
  margin: 5px 0;
  transition: transform 0.3s, opacity 0.3s;
}
```

**Step 2: Replace the responsive nav CSS inside `@media (max-width: 768px)` block**

Replace the nav-related rules inside the media query (`.nav__links`, `.nav__links.open`, `.nav__links a`, `.nav__hamburger`, `.nav__donate--desktop`) with:

```css
  .nav__menu {
    display: none;
    position: absolute;
    top: var(--nav-height);
    left: 0;
    right: 0;
    background: var(--color-white);
    flex-direction: column;
    padding: 0.5rem 1rem 1rem;
    border-bottom: 1px solid var(--color-border);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    gap: 0;
  }

  .nav__menu.open {
    display: flex;
  }

  .nav__hamburger {
    display: block;
  }

  .nav__donate--desktop {
    display: none;
  }

  /* Mobile: dropdowns are always visible (accordion-style) */
  .nav__group {
    border-bottom: 1px solid var(--color-border);
  }

  .nav__group:last-child {
    border-bottom: none;
  }

  .nav__group-label {
    width: 100%;
    padding: 0.85rem 0.5rem;
    font-size: 0.95rem;
    justify-content: space-between;
  }

  .nav__dropdown {
    position: static;
    box-shadow: none;
    border-radius: 0;
    padding: 0 0 0.5rem 0.75rem;
    display: none;
  }

  /* Override desktop hover — only JS toggles on mobile */
  .nav__group:hover > .nav__dropdown,
  .nav__group:focus-within > .nav__dropdown {
    display: none;
  }

  .nav__group.open > .nav__dropdown {
    display: block;
  }

  .nav__group.open > .nav__group-label::after {
    transform: rotate(180deg);
  }

  .nav__dropdown a {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }

  .nav__menu .nav__donate {
    display: block;
    text-align: center;
    margin-top: 0.75rem;
  }
```

**Step 3: Verify CSS syntax**

Open `docs/css/style.css` and confirm there are no missing braces or typos.

**Step 4: Commit**

```bash
git add docs/css/style.css
git commit -m "feat: add mega menu CSS styles replacing flat nav"
```

---

### Task 2: Update JS — Replace hamburger toggle with mega menu logic

**Files:**
- Modify: `docs/js/main.js:1-10` (Mobile nav toggle section)

**Step 1: Replace the mobile nav toggle code (lines 1-10) with mega menu JS**

Replace the existing hamburger code with:

```javascript
// Mega menu — mobile accordion + outside-click-to-close
const hamburger = document.querySelector('.nav__hamburger');
const navMenu = document.querySelector('.nav__menu');

if (hamburger && navMenu) {
  // Toggle mobile menu
  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', navMenu.classList.contains('open'));
  });

  // Mobile accordion — toggle group dropdowns
  navMenu.querySelectorAll('.nav__group-label').forEach(label => {
    label.addEventListener('click', (e) => {
      // Only accordion behavior on mobile
      if (window.innerWidth > 768) return;
      e.preventDefault();
      const group = label.closest('.nav__group');
      const wasOpen = group.classList.contains('open');

      // Close all groups
      navMenu.querySelectorAll('.nav__group.open').forEach(g => g.classList.remove('open'));

      // Toggle clicked group
      if (!wasOpen) group.classList.add('open');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.site-header')) {
      navMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      navMenu.querySelectorAll('.nav__group.open').forEach(g => g.classList.remove('open'));
    }
  });
}
```

Leave the FAQ accordion code (lines 12-35) untouched.

**Step 2: Commit**

```bash
git add docs/js/main.js
git commit -m "feat: add mega menu JS for mobile accordion and outside-click"
```

---

### Task 3: Update nav HTML in docs/index.html (root page)

**Files:**
- Modify: `docs/index.html:16-37` (Header nav section)

**Step 1: Replace the nav HTML**

Replace the `<header>` block (lines 16-38) with:

```html
  <header class="site-header">
    <nav class="nav container">
      <a href="./" class="nav__logo">
        <img src="images/logo.png" alt="Tiny but Mighty Kitten Rescue" width="40" height="40">
      </a>
      <button class="nav__hamburger" aria-label="Toggle menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
      <div class="nav__menu">
        <div class="nav__group has-active">
          <button class="nav__group-label" aria-expanded="false">Our Cats</button>
          <div class="nav__dropdown">
            <a href="adopt/">Adopt</a>
            <a href="favourites/">Favourites</a>
            <a href="lotto-for-cats/">Lotto for Cats</a>
          </div>
        </div>
        <div class="nav__group">
          <button class="nav__group-label" aria-expanded="false">Programs</button>
          <div class="nav__dropdown">
            <a href="subsidized-spay-neuter/">Spay / Neuter</a>
            <a href="about-3/">Feed A Feral</a>
            <a href="empties/">Empties</a>
            <a href="emergency-survival-kit/">Emergency Kit</a>
          </div>
        </div>
        <div class="nav__group">
          <button class="nav__group-label" aria-expanded="false">Get Involved</button>
          <div class="nav__dropdown">
            <a href="volunteer/">Volunteer</a>
            <a href="faq/">FAQ</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
        <a href="donate/" class="nav__donate">Donate</a>
      </div>
      <a href="donate/" class="nav__donate nav__donate--desktop">Donate</a>
    </nav>
  </header>
```

Note: The root page uses paths without `../` prefix. The `has-active` class is NOT on any group because the homepage is not inside a dropdown — it's the logo link.

**Step 2: Commit**

```bash
git add docs/index.html
git commit -m "feat: update root index.html nav to mega menu structure"
```

---

### Task 4: Update nav HTML in all subpages

**Files to modify (all use `../` relative paths):**
- `docs/adopt/index.html` — active: Adopt (Our Cats group)
- `docs/adoptable/index.html` — active: Adopt (Our Cats group)
- `docs/favourites/index.html` — active: Favourites (Our Cats group)
- `docs/lotto-for-cats/index.html` — active: Lotto for Cats (Our Cats group)
- `docs/subsidized-spay-neuter/index.html` — active: Spay / Neuter (Programs group)
- `docs/about-3/index.html` — active: Feed A Feral (Programs group)
- `docs/empties/index.html` — active: Empties (Programs group)
- `docs/emergency-survival-kit/index.html` — active: (Programs group, no explicit active)
- `docs/volunteer/index.html` — active: Volunteer (Get Involved group)
- `docs/faq/index.html` — active: FAQ (Get Involved group)
- `docs/donate/index.html` — active: Donate (standalone button, `active` class on `.nav__donate`)

**Step 1: Replace the `<header>` block in each subpage**

The template for ALL subpages (except donate) is:

```html
  <header class="site-header">
    <nav class="nav container">
      <a href="../" class="nav__logo">
        <img src="../images/logo.png" alt="Tiny but Mighty Kitten Rescue" width="40" height="40">
      </a>
      <button class="nav__hamburger" aria-label="Toggle menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
      <div class="nav__menu">
        <div class="nav__group {{ADD 'has-active' IF page is in Our Cats}}">
          <button class="nav__group-label" aria-expanded="false">Our Cats</button>
          <div class="nav__dropdown">
            <a href="../adopt/" {{class="active" if adopt or adoptable page}}>Adopt</a>
            <a href="../favourites/" {{class="active" if favourites page}}>Favourites</a>
            <a href="../lotto-for-cats/" {{class="active" if lotto page}}>Lotto for Cats</a>
          </div>
        </div>
        <div class="nav__group {{ADD 'has-active' IF page is in Programs}}">
          <button class="nav__group-label" aria-expanded="false">Programs</button>
          <div class="nav__dropdown">
            <a href="../subsidized-spay-neuter/" {{class="active" if spay-neuter page}}>Spay / Neuter</a>
            <a href="../about-3/" {{class="active" if about-3 page}}>Feed A Feral</a>
            <a href="../empties/" {{class="active" if empties page}}>Empties</a>
            <a href="../emergency-survival-kit/" {{class="active" if emergency-kit page}}>Emergency Kit</a>
          </div>
        </div>
        <div class="nav__group {{ADD 'has-active' IF page is in Get Involved}}">
          <button class="nav__group-label" aria-expanded="false">Get Involved</button>
          <div class="nav__dropdown">
            <a href="../volunteer/" {{class="active" if volunteer page}}>Volunteer</a>
            <a href="../faq/" {{class="active" if faq page}}>FAQ</a>
            <a href="../#contact">Contact</a>
          </div>
        </div>
        <a href="../donate/" class="nav__donate">Donate</a>
      </div>
      <a href="../donate/" class="nav__donate nav__donate--desktop">Donate</a>
    </nav>
  </header>
```

Apply `class="active"` and `has-active` per page as follows:

| Page | Active link | Group with `has-active` |
|------|------------|------------------------|
| adopt | `../adopt/` | Our Cats |
| adoptable | `../adopt/` | Our Cats |
| favourites | `../favourites/` | Our Cats |
| lotto-for-cats | `../lotto-for-cats/` | Our Cats |
| subsidized-spay-neuter | `../subsidized-spay-neuter/` | Programs |
| about-3 | `../about-3/` | Programs |
| empties | `../empties/` | Programs |
| emergency-survival-kit | none | none |
| volunteer | `../volunteer/` | Get Involved |
| faq | `../faq/` | Get Involved |
| donate | `class="nav__donate active"` on donate link | none (standalone) |

**Step 2: Commit**

```bash
git add docs/adopt/index.html docs/adoptable/index.html docs/favourites/index.html docs/lotto-for-cats/index.html docs/subsidized-spay-neuter/index.html docs/about-3/index.html docs/empties/index.html docs/emergency-survival-kit/index.html docs/volunteer/index.html docs/faq/index.html docs/donate/index.html
git commit -m "feat: update all subpage navs to mega menu structure"
```

---

### Task 5: Visual testing

**Step 1: Serve the site locally and test**

```bash
cd docs && python3 -m http.server 8000
```

Open `http://localhost:8000` in browser.

**Step 2: Verify desktop behavior**
- 3 group labels visible in top bar with Donate button
- Hovering each group reveals dropdown
- Active page links highlighted
- Parent group label highlighted when containing active page
- Only one dropdown open at a time
- Clicking outside closes dropdown

**Step 3: Verify mobile behavior (resize to <768px)**
- Hamburger icon visible
- Tapping hamburger opens menu with 3 accordion sections + Donate
- Tapping group label expands/collapses its links
- Only one group open at a time
- Active links still highlighted

**Step 4: Test all nav links work**
Navigate to each page and verify the nav links resolve correctly.

**Step 5: Commit any fixes**

```bash
git add -A && git commit -m "fix: mega menu visual adjustments"
```
