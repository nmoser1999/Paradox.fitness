# Paradox Fitness Copy Review

A buildless static presentation site for the November 14, 2026 client copy review. This is a separate site from the Paradox Fitness marketing website.

## Preview

Run `npm run dev` and open `http://127.0.0.1:4337/`. There are no dependencies to install and no build step. The complete website is in `dist/`; it also works by opening `dist/index.html` directly.

## Walkthrough

- Begin on the overview or choose any of the eleven chapters.
- Use the previous and next controls or the left and right arrow keys to walk through all 65 review items.
- Select **Present** or press **P** to hide the chapter sidebar. **Escape** leaves presentation mode.
- Use **Find copy** or **/** to search wording, section IDs, and review notes.
- Record an approval of the current copy, an edit request, or a fact to confirm. Add meeting notes beneath the section.
- Open **Review summary** to export a text file of decisions and notes, or print the summary.

Decisions and notes are stored only in the current browser. They are not shared between devices, visitors, tabs, or users automatically. Export notes after the meeting. Nothing here updates the fitness website.

## Content and design

`dist/review-data.js` contains all 295 original text elements, 65 review notes, explicit proposed wording, and chapter metadata. The current wording was extracted from the existing local review document and checked against a fresh build of the marketing site. Proposed text is separated from current wording. `dist/app.js` handles navigation and browser-local review state; `dist/styles.css` contains the visual design. The original Word review is included under `dist/assets/`.

Run `npm run check` to validate JavaScript syntax, content coverage, local assets, and the hosting manifest. Browser QA also covers navigation, search, persistence, note export, presentation mode, mobile layout, and print styles.

The Site starts private to the owner. Hosting identity is in `.openai/hosting.json`. Do not replace it when updating the site.
