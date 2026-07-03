# Troubleshooting Guide

This guide captures the common local build, preview, deployment, and GitHub Pages issues for this Jekyll site.

## Local Build

Run a production-style build from the repository root:

```powershell
bundle exec jekyll build --trace
```

Expected result:

- `_site/` is generated.
- `_site/index.html` exists.
- `_site/investment/index.html` lists published investment posts.

If Bundler fails because dependencies are missing, run:

```powershell
bundle install
```

## Local Preview

Start a local preview server:

```powershell
bundle exec jekyll serve --host 127.0.0.1 --port 4000
```

Open:

```text
http://127.0.0.1:4000/
```

If WEBrick fails with a permission error in this environment, start it from an elevated/normal terminal outside the sandbox.

For a quiet preview without file watching:

```powershell
bundle exec jekyll serve --no-watch --host 127.0.0.1 --port 4000
```

## GitHub Pages Deployment

This repo deploys through GitHub Actions using:

```text
.github/workflows/deploy.yml
```

Important workflow permissions:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

The workflow:

1. Checks out the repo.
2. Sets up Ruby.
3. Runs Bundler.
4. Builds Jekyll into `_site`.
5. Verifies `_site/index.html` exists.
6. Uploads `_site` as the Pages artifact.
7. Deploys with `actions/deploy-pages`.

In GitHub repo settings:

- Go to `Settings -> Pages`.
- Set source to `GitHub Actions`.

## GitHub Actions: Linux Platform Lockfile Error

If Actions fails with:

```text
Your bundle only supports platforms ["x64-mingw-ucrt"] but your local platform is x86_64-linux
```

Fix locally:

```powershell
bundle lock --add-platform x86_64-linux
```

Then commit `Gemfile.lock`.

## GitHub Actions: Pages Permission Error

If deploy fails with a message like:

```text
deploy-pages needs Pages write permission
```

Make sure `.github/workflows/deploy.yml` has top-level permissions:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

## Post Not Showing On GitHub Pages

Jekyll skips future-dated posts. GitHub Actions runs in UTC, so a post created just after midnight in India can be treated as future-dated.

Use an explicit timezone in the post front matter:

```yaml
date: 2026-07-04 00:10:00 +0530
```

Also check:

- The post is under `_posts/`.
- Filename format is `YYYY-MM-DD-title.md`.
- Front matter includes `layout: post`.
- Category is set if it should appear in a category page.

## Investment Post URLs

The permalink pattern is configured in `_config.yml`:

```yaml
permalink: /investment/:year/:month/:day/:title
```

An investment post such as:

```text
_posts/2026-07-04-forensic-investing-financial-engineering.md
```

publishes at:

```text
/investment/2026/07/04/forensic-investing-financial-engineering
```

## Artifact Content Check

The workflow should upload the generated static site, not the source folder.

Before upload, verify:

```bash
test -f _site/index.html
```

Upload:

```yaml
- name: Upload artifact
  uses: actions/upload-pages-artifact@v3
  with:
    path: _site
```

## Git Push Proxy Issue

If `git push` fails with:

```text
Failed to connect to 127.0.0.1 port 9
```

Clear stale proxy variables for the current terminal:

```powershell
$env:HTTP_PROXY=$null
$env:HTTPS_PROXY=$null
$env:ALL_PROXY=$null
$env:GIT_HTTP_PROXY=$null
$env:GIT_HTTPS_PROXY=$null
```

For one command through `cmd`:

```cmd
set HTTP_PROXY=& set HTTPS_PROXY=& set ALL_PROXY=& set GIT_HTTP_PROXY=& set GIT_HTTPS_PROXY=& git push origin master
```

## GitHub Credential Issue

If GitHub rejects the push with:

```text
Permission to imsank/imsank.github.io.git denied to <wrong-user>
```

Open Windows Credential Manager:

1. Go to `Windows Credentials`.
2. Remove GitHub entries such as `git:https://github.com` or `github.com`.
3. Retry `git push origin master`.
4. Sign in with the GitHub account that has write access to the repo.

## Useful Checks

Repo status:

```powershell
git status --short --branch
```

Recent commits:

```powershell
git log --oneline --decorate -5
```

Remote:

```powershell
git remote -v
```

Build and inspect the investment index:

```powershell
bundle exec jekyll build --trace
Select-String -Path _site\investment\index.html -Pattern "Forensic Investing"
```
