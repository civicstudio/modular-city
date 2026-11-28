# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Modular City is a model municipal website (modularcity.org) demonstrating best practices for civic web presence, open data, and transparent government. It is a Jekyll static site styled with Tailwind CSS 4.x.

## Commands

- **Build CSS**: `npm run build:css`
- **Serve locally**: `bundle exec jekyll serve --livereload` (build CSS first)
- **Run all tests**: `npm test` (builds site, starts server, runs accessibility specs)
- **Run accessibility tests directly**: `bundle exec rake a11y`
- **Run a single spec file**: `bundle exec rspec spec/accessibility_spec.rb --format documentation` (requires site built and served on port 4000)

## Architecture

- **Static site generator**: Jekyll with `jekyll-sitemap` and `jekyll-datapage-generator` plugins
- **CSS**: Tailwind 4.x via `@tailwindcss/cli`. Source is `assets/css/tailwind.css`, output is `assets/css/main.css`
- **Data-driven pages**: `_data/departments.json` and `_data/services.json` auto-generate pages via `jekyll-datapage-generator` using templates in `_layouts/department.html` and `_layouts/service.html`
- **Testing**: RSpec + Capybara + headless Chrome + axe-core for WCAG AAA accessibility compliance. Tests run against the built site served on localhost:4000.
- **Deployment**: Jekyll builds to `_site/`, deployed to S3 via GitHub Actions

## Conventions

- Render HTML with one attribute per line
- All pages must pass WCAG AAA accessibility standards (including 7:1 color contrast)
- Tasks should be managed in PLAN.md as user story scenarios with corresponding tests
