# Site Behavior

This document records the site's content-selection and navigation behavior so future content and layout changes remain intentional.

## Home Page

The home page is defined in `index.md`.

### Latest Thread

The **Latest thread** section at the bottom of the home page automatically displays the newest investment post.

The selection logic:

1. Iterates through `site.posts`, which Jekyll orders from newest to oldest.
2. Selects the first post whose `categories` or `tags` contain `investment`.
3. Displays the post title, an excerpt truncated to 24 words, and a **Read the note** link.
4. Stops searching after the first matching post.
5. Hides the entire section when no matching investment post exists.

A new post will appear in this section when it is added to `_posts/` with a newer date and either of these front matter values:

```yaml
categories: investment
```

or:

```yaml
tags:
  - investment
```

Articles in the `_interests/` collection do not appear in Latest thread because they are not part of `site.posts`.

## Investment Page

The Investment page is defined in `investment/index.html`.

- It lists every post whose categories or tags contain `investment`.
- Posts are displayed from newest to oldest.
- The search field filters the rendered post cards in the browser by their visible text.
- When no posts match a search, the page displays **No matching posts**.
- When the site contains no investment posts, the page displays an empty state instead of the list.

## Interested Page

The Interested page is defined in `interested/index.html`.

- It reads content from the custom `interests` collection configured in `_config.yml`.
- Articles are sorted by their `date` value from newest to oldest.
- Each item links to `/interested/<filename>/`.
- A description is shown when provided; otherwise, Jekyll uses a truncated excerpt.

## Theme

The default layout provides light and dark themes.

- A saved theme in `localStorage` takes priority.
- Without a saved choice, the site follows the browser's `prefers-color-scheme` setting.
- The navigation toggle switches themes and saves the selection for later visits.

## Deployment

The GitHub Actions workflow in `.github/workflows/deploy.yml` builds and deploys the site when changes are pushed to `master`. It can also be run manually through `workflow_dispatch`.