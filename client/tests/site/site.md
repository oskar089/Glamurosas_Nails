# Site interaction and visual checks

- Keyboard users can skip navigation, open the mobile menu, tab to its links, and dismiss with Escape while restoring toggle focus.
- Route changes focus the main landmark; mobile navigation closes after selection.
- Contact has no fabricated phone or email links; unknown URLs offer a working home link.
- All seven routes have one main heading, no uncaught runtime errors, and no horizontal overflow at desktop and mobile widths.
- The homepage and gallery load all their real images and produce full-page screenshots at both viewport sizes, waiting for lazy images before capture.
- Home, gallery, booking, and reviews also fit a 320px viewport; reduced-motion mode disables button transitions.

Only the visual-reference scenario depends on external asset availability. Mobile checks use Chromium emulation, not physical iOS or Android devices.
