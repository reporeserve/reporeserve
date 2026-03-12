# QA Checklist — RepoReserve Public Site

## Pre-Launch Verification

- [ ] **Responsive layout** — Open in Chrome DevTools and verify at 640px (mobile), 768px (tablet), and 1200px (desktop). Hero should stack to single-column on tablet and below. Buttons should be full-width on mobile. No horizontal scroll at any breakpoint.

- [ ] **Keyboard accessibility & modal focus** — Tab through the entire page. Verify all nav links, accordion buttons, CTAs, and form fields are reachable. Open the meeting request modal: confirm focus moves to the first input. Tab to the last element then Tab again — focus must cycle back to the close button. Press Escape — modal closes and focus returns to the button that opened it.

- [ ] **Form validation** — Open the modal, submit empty. Confirm error messages appear on all required fields (Name, Institution, Email) and focus jumps to the first error. Enter an invalid email (e.g. `test@`) and submit — email error must appear. Fill all required fields correctly — success view must display with "Request Received" message.

- [ ] **Gzipped file size** — Run: `gzip -k index.html && ls -la index.html.gz`. Confirm the `.gz` file is **under 1 MB** (target: well under 50 KB gzipped for this page). Remove the test file: `rm index.html.gz`.

- [ ] **No IP leaks or internal details** — Review the complete page for any technical architecture diagrams, API endpoints, dashboard screenshots, data models, settlement flow descriptions, or system internals. None should be present. Verify partner logos show "pilot participant — permission required." Confirm the site never uses the phrase "trading platform."
