# Taiwo Badmus: Portfolio and Academic Planner

A responsive personal portfolio with an interactive academic planner. Built with HTML, CSS and JavaScript only.

## Pages
- `index.html` home, `about.html` background and skills, `projects.html` work, `planner.html` tasks and live clock, `contact.html` message form
- `resume.html` printable CV, `quiz.html` and `landing.html` project demos, `404.html`

## Files
`css/style.css` (light and dark themes, one font and one type scale), `js/` (one script per feature), `fonts/` (Manrope, self-hosted, SIL Open Font License), `img/`, `media/`

## Voice intro
`media/taiwo-intro.mp3` and `media/taiwo-intro.ogg` are Taiwo's own recording (cleaned, long pauses trimmed, volume levelled). To swap it, export the new recording in both formats with the same names.

## Contact form
Validates with JavaScript, then opens the visitor's own email with the message already written, so they only press Send.
- Phone or tablet (iPhone, iPad, Android): opens the email app on the device.
- Laptop or desktop: opens Gmail in a new browser tab. Outlook, the computer's email app and a Copy message button are one click away, and the visitor's choice is remembered.
- The message always goes to the address set in `js/contact.js` (`TO`). To send straight to the inbox with no email step, fill in the three EmailJS keys at the top of that file.

## Theme
The site opens in dark mode. The light theme is blue, not white. A visitor's choice is saved in the browser (key `tb-theme-v3`). The cursor is a blue arrow, and a blue hand over links and buttons (set in the tokens at the top of `css/style.css`).

## Home page
`index.html` with `js/home.js` (typed line, count-up numbers, scroll bar, code window tabs, pointer glow, copy email) and `js/marquee.js` (the languages and tools marquee). Sections: hero, numbers, front end and back end, what I can build, learning path, how I build, featured projects, marquee, call to action.

## Project screenshots
`img/planner.webp`, `img/landing.webp` and `img/quiz.webp` are real screenshots of the running pages. Retake them if you change those pages.

## Hosting
Push this folder to GitHub, then import the repository on Vercel (or enable GitHub Pages).
