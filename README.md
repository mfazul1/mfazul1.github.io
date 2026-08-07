# JEEIITianBooks.in

A free JEE & IIT preparation hub that provides curated books, chapter-wise practice tests, and topper study tips for Physics, Chemistry, and Mathematics aspirants.

Live site: https://jeeiitianbooks.in

## Features

- **Free Books** – 78+ hand-picked PDF books and notes, downloadable without registration or payment.
- **Top Books** – A curated list of topper-recommended books with official (Amazon / publisher) links.
- **Practice Test** – Chapter-wise, timed mock tests with auto-submit, instant scoring, and step-by-step explanations (backed by the Groq API).
- **Topper Tips** – Study strategies, exam-day tactics, and revision guidance.
- **AI Chatbot** – In-page assistant that answers JEE-related questions.
- **FAQ** – 28 commonly asked questions with live search filtering.
- **Contact / Connect** – Contact form powered by `mail.php`, with location map and support details.
- **SEO optimised** – Unique per-page meta tags, Open Graph / Twitter cards, JSON-LD structured data (`WebSite`, `Organization`, `BreadcrumbList`, `FAQPage`), canonical URLs, `sitemap.xml`, and `robots.txt`.
- **Responsive & polished** – Mobile-first Bootstrap layout with a consistent professional design system (gradient CTAs, highlighted stats, and 3D hover effects).

## Tech Stack

- HTML5, CSS3, Bootstrap 4
- Vanilla JavaScript + jQuery
- PHP (contact form: `mail.php`, feedback: `submit_feedback.php`)
- Google Analytics (GA4 via gtag `G-VJG4F1NRM9`)
- Groq API (practice test question generation & chat)
- JSON data endpoints (npoint.io) with local JSON fallbacks

## Project Structure

```
.
├── index.html                  # Home page
├── about/                      # About us
├── connect/                    # Contact / connect page (mail.php form)
├── jee-iit-free-books/         # Free books library
├── jee-iit-top-books/          # Topper-recommended books
├── jee-iit-topper-tips/        # Study tips & strategies
├── jee-iit-practice-test/      # Timed practice tests (js/exam.js)
├── jee-iit-faqs/               # FAQ with live search
├── offline/                    # Offline fallback page
├── css/                        # All stylesheets
├── js/                         # All scripts (chatbot.js, exam.js, main.js, ...)
├── img/                        # Site images
├── doc_data.json               # Free books data (78 books)
├── topbooks.json               # Top books fallback data
├── mail.php                    # Contact form handler
├── submit_feedback.php         # Feedback handler
├── sitemap.xml                 # XML sitemap
├── sitemap_google.xml          # Google sitemap
├── robots.txt                  # Crawler rules
└── CNAME                       # GitHub Pages custom domain
```

## Setup & Development

This is a static site (with PHP handlers) and can be served by any web server. To run locally:

```bash
# Python
python -m http.server 8000

# PHP (to test mail.php / submit_feedback.php)
php -S localhost:8000
```

Then open http://localhost:8000.

> Note: `mail.php` requires a PHP environment (e.g. shared hosting) to send emails.

### Cache Busting

Stylesheets are versioned with query strings (e.g. `main.css?v=11`). Bump the version number on the relevant page(s) whenever `css/main.css` changes so visitors pick up the update.

## Deployment

The site is deployed on **GitHub Pages** and served from the repository root via the `CNAME` file (`jeeiitianbooks.in`). Push to the `main` branch to publish.

## Project History

Previously the site lived at `books/`, `topbooks/`, `toppertips/`, `practicetest/`, and `faqs/`. These were renamed to SEO-friendly `/jee-iit-*` URLs, and all internal links were updated accordingly.
