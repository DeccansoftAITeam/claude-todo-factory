# Vision

A small, fast, delightful todo list that runs entirely in the browser.

## Product direction
- **Zero friction** — open the page and type. No accounts, no setup.
- **Keyboard first** — every action works without a mouse.
- **Trustworthy** — todos survive reloads (`localStorage`), and nothing leaves the device.
- **Calm UI** — one list, clear states (empty, active, completed), light and dark themes.

## Factory purpose
This app is the target of a **Claude headless software factory**. It is deliberately
small, so every stage (triage → implement → review → verify on Azure → merge → deploy)
is easy to watch and trust. Good issues are small, user-visible improvements whose
outcome a browser can verify.

## Non-goals
Accounts, sync, backends, collaboration, notifications, heavy frameworks, build tooling.
