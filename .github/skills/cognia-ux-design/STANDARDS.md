# UI/UX Design Standards

> **Tier 2 — Skill-local standards.** 
Reference templates for producing `{project_name}-ui-ux-pages.html` and the design system.
Customize all colors, typography, and component labels to the project's brand requirements.

---

## CSS Design Tokens

Define these as CSS custom properties in the HTML file and in the React implementation as `styles/tokens.css`.

### Typography Scale
```css
/* Font Scale */
--font-xs:   0.75rem;    /* 12px */
--font-sm:   0.875rem;   /* 14px */
--font-base: 1rem;       /* 16px */
--font-lg:   1.125rem;   /* 18px */
--font-xl:   1.25rem;    /* 20px */
--font-2xl:  1.5rem;     /* 24px */
--font-3xl:  1.875rem;   /* 30px */

/* Font Weights */
--weight-normal:   400;
--weight-medium:   500;
--weight-semibold: 600;
--weight-bold:     700;

/* Line Heights */
--leading-tight:  1.25;
--leading-normal: 1.5;
--leading-loose:  1.75;
```

### Color Palette (default — customize per brand)
```css
/* Primary */
--color-primary-50:  #eff6ff;
--color-primary-100: #dbeafe;
--color-primary-500: #3b82f6;
--color-primary-600: #2563eb;
--color-primary-700: #1d4ed8;
--color-primary-900: #1e3a8a;

/* Neutral */
--color-neutral-50:  #f9fafb;
--color-neutral-100: #f3f4f6;
--color-neutral-200: #e5e7eb;
--color-neutral-400: #9ca3af;
--color-neutral-500: #6b7280;
--color-neutral-700: #374151;
--color-neutral-900: #111827;

/* Semantic */
--color-success: #10b981;
--color-warning: #f59e0b;
--color-error:   #ef4444;
--color-info:    #3b82f6;

/* WCAG-compliant text on white (≥ 4.5:1) */
/* --color-neutral-900 on white: 16.1:1 ✅ */
/* --color-primary-700 on white: 5.8:1 ✅ */
```

### Spacing Scale
```css
--space-1:  0.25rem;   /* 4px */
--space-2:  0.5rem;    /* 8px */
--space-3:  0.75rem;   /* 12px */
--space-4:  1rem;      /* 16px */
--space-5:  1.25rem;   /* 20px */
--space-6:  1.5rem;    /* 24px */
--space-8:  2rem;      /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
```

---

## Responsive Design Breakpoints

```css
/* Mobile-First breakpoints */
/* xs:  < 480px    — Mobile portrait */
/* sm:  >= 480px   — Mobile landscape */
/* md:  >= 768px   — Tablet */
/* lg:  >= 1024px  — Desktop */
/* xl:  >= 1280px  — Wide desktop */
/* 2xl: >= 1536px  — Ultra-wide */
```

Adaptation rules per screen type:

| Screen | Mobile (< 768px) | Tablet (768–1024px) | Desktop (≥ 1024px) |
|---|---|---|---|
| Dashboard | Single column, bottom nav | 2-col grid, collapsed sidebar | Full sidebar + 4-col KPI row |
| List View | Card stack | 2-col cards | Full-width table |
| Form | Full screen modal | Centered dialog | Side panel or dialog |
| Navigation | Bottom tab bar | Collapsible sidebar | Fixed sidebar |

---

## HTML Wireframe Page Template

Complete starting template for `{project_name}-ui-ux-pages.html`. Add screen sections as needed.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>UI/UX Design Wireframes</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/panzoom@9/dist/panzoom.min.js"></script>
  <script>
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'system-ui, Segoe UI, sans-serif',
      fontSize: 15,
      flowchart: { curve: 'basis', htmlLabels: true },
      sequence: { actorMargin: 80, boxMargin: 10 }
    });
  </script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, 'Segoe UI', sans-serif; background: #fdfaf5; color: #1a1a1a; }
    .page { max-width: 1200px; margin: 2rem auto; padding: 0 1rem; }
    h1 { font-size: 2rem; font-weight: 700; color: #7c4a1e; margin-bottom: 0.5rem; }
    h2 { font-size: 1.25rem; font-weight: 600; color: #1e3a5f; margin: 2rem 0 1rem;
         border-left: 4px solid #e07840; padding-left: 0.75rem; }
    .wireframe { background: white; border: 2px dashed #e8d9c4; border-radius: 8px;
                 padding: 1.5rem; margin-bottom: 2rem; }
    .wireframe-label { font-size: 0.75rem; font-weight: 600; color: #9a7a5a;
                       text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem; }

    /* Layout helpers */
    .layout { display: grid; gap: 1rem; }
    .sidebar { background: #ede9e2; color: #2c1a0e; padding: 1rem; border-radius: 6px; min-height: 400px; border: 1px solid #e8d9c4; }
    .nav-item { padding: 0.5rem 0.75rem; border-radius: 4px; margin-bottom: 0.25rem;
                cursor: pointer; font-size: 0.875rem; color: #5a3a1e; }
    .nav-item.active { background: #e8c89a; color: #3d1f0a; font-weight: 600; }
    .content-area { flex: 1; }
    .header-bar { background: white; border: 1px solid #e8d9c4; border-radius: 6px;
                  padding: 1rem; display: flex; align-items: center; justify-content: space-between;
                  margin-bottom: 1rem; }
    .card { background: white; border: 1px solid #e8d9c4; border-radius: 8px; padding: 1.25rem; }
    .card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                 gap: 1rem; margin-bottom: 1rem; }
    .kpi { text-align: center; }
    .kpi-value { font-size: 2rem; font-weight: 700; color: #1e3a5f; }
    .kpi-label { font-size: 0.875rem; color: #9a7a5a; margin-top: 0.25rem; }
    .table-mock { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
    .table-mock th { background: #f5e4c8; padding: 0.75rem; text-align: left;
                     border-bottom: 2px solid #e8d9c4; color: #5a3010; font-weight: 600; }
    .table-mock td { padding: 0.75rem; border-bottom: 1px solid #e8d9c4; color: #2c1a0e; }
    .table-mock tr:hover td { background: #fdf5e8; }
    .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem;
           border-radius: 6px; font-size: 0.875rem; font-weight: 500; border: none; cursor: pointer; }
    .btn-primary   { background: #1e3a5f; color: white; }
    .btn-secondary { background: #f3ede4; color: #2c1a0e; }
    .badge { display: inline-flex; padding: 0.125rem 0.5rem; border-radius: 9999px;
             font-size: 0.75rem; font-weight: 600; }
    .badge-success { background: #d1fae5; color: #065f46; }
    .badge-warning { background: #fef9c3; color: #713f12; }
    .badge-error   { background: #fee2e2; color: #9b2c2c; }
    .form-group { margin-bottom: 1rem; }
    .form-label { display: block; font-size: 0.875rem; font-weight: 500;
                  color: #5a3a1e; margin-bottom: 0.375rem; }
    .form-input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #e8d9c4;
                  border-radius: 6px; font-size: 0.875rem; background: #fff; }
    .diagram { background: white; padding: 1.5rem; border-radius: 8px;
               box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 2rem;
               overflow: hidden; position: relative; min-height: 140px; }
  </style>
</head>
<body>
  <div class="page">
    <h1>UI/UX Design Wireframes</h1>
    <p style="color:#718096; margin-bottom:2rem;">Design system wireframes for [Project Name]</p>

    <!-- SCREEN 1: Dashboard -->
    <h2>Screen 1: Dashboard</h2>
    <div class="wireframe">
      <div class="wireframe-label">Dashboard Layout Wireframe</div>
      <div class="layout" style="grid-template-columns: 220px 1fr;">
        <div class="sidebar">
          <div style="font-size:1.125rem; font-weight:700; margin-bottom:1.5rem;
               padding-bottom:0.75rem; border-bottom:1px solid #4a5568;">[App Name]</div>
          <div class="nav-item active">Dashboard</div>
          <div class="nav-item">Module A</div>
          <div class="nav-item">Module B</div>
          <div class="nav-item">Reports</div>
          <div class="nav-item">Settings</div>
        </div>
        <div class="content-area">
          <div class="header-bar">
            <h3 style="font-size:1.25rem; font-weight:600;">Dashboard</h3>
            <div style="display:flex; gap:0.5rem; align-items:center;">
              <button class="btn btn-primary">+ New Item</button>
              <div style="width:2rem; height:2rem; background:#1e3a5f; border-radius:50%;"></div>
            </div>
          </div>
          <div class="card-grid">
            <div class="card kpi"><div class="kpi-value">—</div><div class="kpi-label">KPI Metric 1</div></div>
            <div class="card kpi"><div class="kpi-value">—</div><div class="kpi-label">KPI Metric 2</div></div>
            <div class="card kpi"><div class="kpi-value">—</div><div class="kpi-label">KPI Metric 3</div></div>
            <div class="card kpi"><div class="kpi-value">—</div><div class="kpi-label">KPI Metric 4</div></div>
          </div>
          <div class="card">
            <div style="display:flex; justify-content:space-between; margin-bottom:1rem;">
              <h4 style="font-size:1rem; font-weight:600;">Recent Items</h4>
              <input class="form-input" style="width:200px;" placeholder="Search...">
            </div>
            <table class="table-mock">
              <thead><tr><th>Name</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                <tr><td>Item 1</td><td><span class="badge badge-success">Active</span></td><td>2026-04-10</td>
                    <td><button class="btn btn-secondary" style="padding:0.25rem 0.5rem;">View</button></td></tr>
                <tr><td>Item 2</td><td><span class="badge badge-warning">Pending</span></td><td>2026-04-09</td>
                    <td><button class="btn btn-secondary" style="padding:0.25rem 0.5rem;">View</button></td></tr>
                <tr><td>Item 3</td><td><span class="badge badge-error">Error</span></td><td>2026-04-08</td>
                    <td><button class="btn btn-secondary" style="padding:0.25rem 0.5rem;">View</button></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- SCREEN 2: Login -->
    <h2>Screen 2: Login</h2>
    <div class="wireframe">
      <div class="wireframe-label">Login Screen Wireframe</div>
      <div style="max-width:400px; margin:0 auto; padding:2rem;">
        <div class="card" style="padding:2rem;">
          <h3 style="font-size:1.5rem; font-weight:700; text-align:center; margin-bottom:0.5rem;">[App Name]</h3>
          <p style="text-align:center; color:#718096; margin-bottom:2rem; font-size:0.875rem;">Sign in to your account</p>
          <div class="form-group">
            <label class="form-label">Username / Email</label>
            <input class="form-input" placeholder="Enter username or email">
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input class="form-input" type="password" placeholder="Enter password">
          </div>
          <button class="btn btn-primary" style="width:100%; justify-content:center; padding:0.625rem;">Sign In</button>
          <p style="text-align:center; font-size:0.75rem; color:#718096; margin-top:1rem;">Or sign in with LDAP / SSO</p>
        </div>
      </div>
    </div>

    <!-- Navigation Structure (IA Diagram) -->
    <h2>Information Architecture</h2>
    <div class="diagram">
      <pre class="mermaid">
graph TD
  LOGIN[Login] --> DASH[Dashboard]
  DASH --> MOD_A[Module A]
  DASH --> MOD_B[Module B]
  DASH --> REPORTS[Reports]
  DASH --> SETTINGS[Settings]
  MOD_A --> A_LIST[List View]
  MOD_A --> A_DETAIL[Detail View]
  MOD_A --> A_FORM[Create / Edit Form]
  MOD_B --> B_LIST[List View]
  MOD_B --> B_DETAIL[Detail View]
  REPORTS --> RPT_DASH[Report Dashboard]
  REPORTS --> RPT_EXPORT[Export Reports]
  SETTINGS --> PROFILE[User Profile]
  SETTINGS --> ADMIN[Admin Panel]
      </pre>
    </div>

    <!-- User Journey Map -->
    <h2>User Journey Map</h2>
    <div class="diagram">
      <pre class="mermaid">
journey
  title Primary User Journey: [Core Use Case]
  section Authentication
    Open Application: 5: User
    Enter Credentials: 4: User
    Pass LDAP Auth: 3: User, System
  section Core Task
    View Dashboard: 5: User
    Navigate to Module: 5: User
    Perform Action: 4: User
    Confirm Success: 5: User, System
  section Exit
    Review Results: 5: User
    Logout: 5: User
      </pre>
    </div>

  </div>
<script>
  (async function() {
    await mermaid.run({ querySelector: '.mermaid' });
    document.querySelectorAll('.diagram').forEach(function(wrap) {
      var svg = wrap.querySelector('svg');
      if (!svg) return;
      var tb = document.createElement('div');
      tb.style.cssText = 'display:flex;gap:6px;margin-bottom:10px;';
      [['＋','zoomIn'],['－','zoomOut'],['⊙ Reset','reset']].forEach(function(pair) {
        var btn = document.createElement('button');
        btn.textContent = pair[0];
        btn.style.cssText = 'background:#f5e4c8;color:#5a3010;border:1px solid #e07840;border-radius:4px;padding:3px 10px;cursor:pointer;font-size:0.82rem;font-family:inherit;';
        btn.onmouseover = function(){ this.style.background='#e07840'; this.style.color='#fff'; };
        btn.onmouseout  = function(){ this.style.background='#f5e4c8'; this.style.color='#5a3010'; };
        btn._act = pair[1];
        tb.appendChild(btn);
      });
      wrap.insertBefore(tb, wrap.firstChild);
      svg.style.cursor = 'grab';
      var pz = panzoom(svg, { maxZoom: 5, minZoom: 0.15, zoomDoubleClickSpeed: 1 });
      tb.querySelectorAll('button').forEach(function(btn) {
        btn.addEventListener('click', function() { pz[btn._act](); });
      });
    });
  })();
</script>
</body>
</html>
```

---

## WCAG 2.1 AA Contrast Reference

| Combination | Ratio | AA Normal Text | AA Large Text |
|---|---|---|---|
| `#111827` (neutral-900) on white | 16.1:1 | ✅ | ✅ |
| `#374151` (neutral-700) on white | 10.7:1 | ✅ | ✅ |
| `#1d4ed8` (primary-700) on white | 5.8:1 | ✅ | ✅ |
| `#6b7280` (neutral-500) on white | 4.6:1 | ✅ | ✅ |
| `#9ca3af` (neutral-400) on white | 2.8:1 | ❌ | ❌ — avoid for text |

Verify all custom brand colors at [webaim.org/resources/contrastchecker](https://webaim.org/resources/contrastchecker/).
