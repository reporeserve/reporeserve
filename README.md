# RepoReserve — Public Site

Target: **< 1 MB gzipped** single-page static site. No external dependencies.

## File Structure

```
index.html                              Main site (HTML + inline CSS + JS)
brochure.md                             One-page institutional brochure
copy_blocks.txt                         All copy organized by section
README.md                               This file
QA.md                                   Developer QA checklist
assets/
  favicon.ico                           Browser tab icon
  logo.png                              Header logo (28×28 or 56×56 @2x)
  brochure/
    reporeserve-overview.pdf            Downloadable institutional overview
  images/
    hero-illustration.png               Optional: replace inline SVG hero visual
  partners/                             Partner logos (SVG or PNG, <20KB each)
```

## Quick Start

```bash
# Serve locally
python3 -m http.server 8000
# Open http://localhost:8000
```

No build step required. Open `index.html` directly in a browser or serve via any static host.

---

## Replacing Placeholder Content

### Logo

Search for `<!-- REPLACE: assets/logo.png` in `index.html`. The `<img>` tag in `.logo` references `assets/logo.png`. Place your logo file there (28×28px recommended, or 56×56 for 2× retina). Supported formats: PNG, SVG, WebP.

### Favicon

The `<link rel="icon">` in `<head>` points to `assets/favicon.ico`. Replace with your `.ico` or `.png` favicon.

### Contact Email

Search for `contact@reporeserve.com` — appears in the footer `<a href="mailto:...">` tag. Replace with your actual address.

### Company Name & Location

Search for `RepoReserve Technologies Pvt Ltd` and `Hyderabad, India` in the footer section.

### Founder / Team

Search for `Rakesh Kottha` and the bio paragraph in the `#team` section.

### Partner Logos

Search for `<!-- REPLACE: swap placeholders`. Replace `.partner-placeholder` divs with `<img>` tags pointing to `assets/partners/partner-name.svg`. Each should be labelled **"pilot participant — permission required"** until written consent is obtained.

### Brochure PDF

All download links point to `assets/brochure/reporeserve-overview.pdf`. Place your PDF there. The `download` attribute triggers a download; `target="_blank"` provides a fallback for browsers that don't support `download`.

---

## Connecting the Form

The meeting request form validates client-side and shows a success message. To send data to a backend:

### Option A: Direct POST to Your Server

In `index.html`, find the comment block `REPLACE: Submit form data`. Uncomment and edit:

```javascript
fetch('/api/meeting-request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name:        form.elements.name.value,
    institution: form.elements.institution.value,
    role:        form.elements.role.value,
    email:       form.elements.email.value,
    phone:       form.elements.phone.value,
    message:     form.elements.message.value,
  })
});
```

### Option B: Formspree

1. Create a form at [formspree.io](https://formspree.io).
2. Replace the fetch URL with `https://formspree.io/f/YOUR_FORM_ID`.
3. Use `new FormData(form)` as the body.

### Option C: Zapier Webhook

1. Create a Zap with "Webhooks by Zapier" (Catch Hook) trigger.
2. Replace the fetch URL with your webhook URL.
3. Add a Zapier action for email notification or CRM entry.

---

## NDA Gating Flow (Recommended)

**Do not auto-serve NDA documents or sensitive materials.**

Recommended manual process:

1. A meeting request arrives via the form (email notification or CRM entry).
2. A team member reviews the inquiry and verifies the requester's identity and institutional affiliation (check corporate email domain, LinkedIn, etc.).
3. If approved, send a mutual NDA via email or DocuSign for signature.
4. Only after both parties execute the NDA should any product details, demos, architecture documentation, or platform access be shared.

This keeps NDA delivery manual and auditable. Do not build automated NDA serving into the site.

---

## Security Header Recommendations

When deploying behind a web server (Nginx, Cloudflare, etc.), add these headers:

```
Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; img-src 'self' data:;
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## CSS Customization

All visual tokens are in `:root` CSS variables at the top of `index.html`:

| Variable | Purpose |
|---|---|
| `--color-bg-deep` | Primary deep background |
| `--color-accent` | Electric blue accent / CTAs |
| `--color-teal` | Secondary teal accent |
| `--font-stack` | System font stack |
| `--max-w` | Container max width |
| `--sp-*` | Spacing scale |

---

## Browser Support

Tested against modern evergreen browsers (Chrome, Firefox, Safari, Edge). Uses `IntersectionObserver` for scroll animations with graceful fallback. No polyfills required.
