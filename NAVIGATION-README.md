# CuraOne Navigation System - Single Source of Truth

## ⚠️ CRITICAL: ONE NAVIGATION SYSTEM ONLY

This project uses **ONE AND ONLY ONE** navigation system located at:
- **JavaScript**: `/public/js/shared-nav.js`
- **Boilerplate**: `/nav-boilerplate.txt`

## DO NOT CREATE:
- ❌ enhanced-navigation.js
- ❌ custom-nav.js
- ❌ navigation-component.js
- ❌ Any other navigation files

## Usage

### In Every HTML Page:
```html
<div id="nav-container"></div>
<div id="top-nav-container"></div>
<script src="/js/shared-nav.js"></script>
<script>initSharedComponents('pageName');</script>
```

Replace `'pageName'` with: `dashboard`, `patients`, `appointments`, `visits`, `users`, `settings`

## Features
- ✅ Left sidebar navigation with toggle (minimize/maximize)
- ✅ Top navbar with search, user info, and logout
- ✅ Automatic active page highlighting
- ✅ Responsive design
- ✅ Smooth transitions

## Modification Rules
1. All navigation changes go in `/public/js/shared-nav.js`
2. Test changes on all pages before committing
3. Never duplicate navigation code
4. Keep it simple and consistent

## File Structure
```
public/
├── js/
│   └── shared-nav.js          ← ONLY navigation file
└── views/
    ├── dashboard.html         ← Uses shared-nav.js
    ├── patients.html          ← Uses shared-nav.js
    └── appointments.html      ← Uses shared-nav.js
```

## Questions?
Check `/nav-boilerplate.txt` for copy-paste template.
