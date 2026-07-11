# imsank.github.io

Source code and content for [Murari Shankar's personal website](https://imsank.github.io). The site is a Jekyll-powered notebook covering AI, long-term investing, cooking, football, and books.

## Technology

- [Jekyll](https://jekyllrb.com/) with the GitHub Pages gem
- Liquid templates and Markdown content
- Custom HTML, CSS, and vanilla JavaScript
- GitHub Actions deployment to GitHub Pages

## Local Development

### Prerequisites

- Ruby 3.3 (the deployment workflow uses Ruby 3.3)
- Bundler

Install the locked dependencies:

```sh
bundle install
```

Start the development server with live reload:

```sh
bundle exec jekyll serve --livereload
```

Open `http://localhost:4000` in a browser.

To create a production build without starting a server:

```sh
JEKYLL_ENV=production bundle exec jekyll build
```

On PowerShell, set the environment variable with:

```powershell
$env:JEKYLL_ENV = "production"
bundle exec jekyll build
```

The generated site is written to `_site/`.

## Repository Structure

```text
.
|-- _config.yml          # Jekyll configuration, routes, and site metadata
|-- _includes/           # Reusable page fragments
|-- _interests/          # Content in the custom `interests` collection
|-- _layouts/            # Default, post, and interest page templates
|-- _posts/              # Date-based investment posts
|-- assets/              # Images and other static assets
|-- css/main.css         # Site styles and responsive/dark themes
|-- index.md             # Home page
|-- interested/          # Interests listing page
|-- investment/          # Investment listing and client-side search
|-- Gemfile              # Ruby dependencies
`-- .github/workflows/   # GitHub Pages build and deployment workflow
```

## Adding Content

### Investment Post

Create a file in `_posts/` named `YYYY-MM-DD-title.md`. Include `investment` as a category or tag so it appears on the Investment page and can be selected as the latest home-page article.

```yaml
---
layout: post
title: "Article title"
date: 2026-07-11 10:00:00 +0530
categories: investment
tags:
  - investment
  - example-topic
---

Article content goes here.
```

Posts are published at `/investment/YYYY/MM/DD/title` according to `_config.yml`.

### Interest Article

Create a Markdown file in `_interests/` with this front matter:

```yaml
---
layout: interest
title: "Article title"
description: A short description used on the listing page.
category: Football
date: 2026-07-11
---

Article content goes here.
```

Interest articles are published at `/interested/<filename>/` and automatically appear on the Interested page.

Store article images under `assets/` and reference them through Jekyll's `relative_url` filter so links also work when the site is hosted under a base path:

```liquid
![Alt text]({{ "/assets/images/example.png" | relative_url }})
```

## Deployment

Pushing to the `master` branch triggers `.github/workflows/deploy.yml`. GitHub Actions installs the locked gems, builds the site in production mode, uploads `_site/`, and deploys it to GitHub Pages. The workflow can also be started manually from the Actions tab with `workflow_dispatch`.

Before pushing, verify the site locally:

```sh
bundle exec jekyll build
```
