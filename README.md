# Modular City

Modular City is a working, data-driven example website for public agencies and
nonprofits. It uses Jekyll, JSON data files, Tailwind CSS, and GitHub Pages.

## Run the example in five minutes

Prerequisites: Ruby 4.0 or newer with Bundler and Node.js 22 with npm. The repository's
`.ruby-version` and `.node-version` files work with common version managers.

```sh
git clone https://github.com/civicstudio/modular-city.git
cd modular-city
bin/setup
bin/dev
```

Visit <http://127.0.0.1:4000/>. The development server rebuilds the site and
refreshes the browser when a page or city data file changes.

## Try the city-data editing loop

1. Open `_data/city/services.json`.
2. Change the `name` of a service.
3. Save the file.
4. Refresh <http://127.0.0.1:4000/services.html> if LiveReload has not already
   refreshed it.

The services index and the generated service detail page use that working copy.
Run `npm run test:data` at any time for a quick JSON and relationship check.

## Example data and city data

The boundary is intentional:

- `_data/*.json` contains upstream-owned fictional example data.
- `_data/city/*.json` contains the agency's working data.
- `bin/setup` copies only missing example files. It never overwrites city data.
- `_data/city/` is ignored in this upstream repository, so pulling upstream
  changes does not replace or conflict with a city's records.

For experiments, leaving the working data ignored is convenient. For a real
public website, preserve the Git review and audit trail by committing it in the
agency's fork once:

```sh
git add -f _data/city
git commit -m "Add our city data"
```

Upstream does not own paths beneath `_data/city/`, so later upstream updates can
change the application or the examples without changing the agency's content.

## Commands

```sh
bin/setup                 # Copy missing data, install dependencies, build CSS
bin/setup --data-only     # Copy missing example data without installing packages
bin/dev                   # Validate data and run Jekyll with LiveReload
npm run test:data         # Validate the required JSON files and service IDs
npm test                  # Run data and accessibility checks
```

The generated site is written to `_site/` and is deployed from `main` by the
GitHub Pages workflow.
