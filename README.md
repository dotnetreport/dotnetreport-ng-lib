# dotnetreport-ng workspace

Source for [`dotnetreport-ng`](https://www.npmjs.com/package/dotnetreport-ng), the Angular components for [Dotnet Report](https://dotnetreport.com). To use the package in your app, see its [README](projects/dotnetreport-lib/README.md) and the [Install with Angular](https://dotnetreport.com/docs/#installation-angular) guide.

The source lives in the Dotnet Report repository under `angular/`, next to the .NET front end it shares its markup with, and is published to npm by the release pipeline. The [GitHub repository](https://github.com/dotnetreport/dotnetreport-ng-lib) is a public copy.

## Layout

| Path | What it is |
|---|---|
| `projects/dotnetreport-lib` | The library: one component per screen (report, dashboard, setup, users) |
| `projects/dotnetreport-lib/src/lib/templates.ts` | Generated: the screens' markup and Knockout templates |
| `projects/dotnetreport-app` | Demo app with a route per screen |
| `scripts/sync-templates.mjs` | Generates `templates.ts` from the main app's Razor views |
| `scripts/set-version.js`, `scripts/check-release.js` | Used by the release pipeline |

The markup is never edited here. `sync-templates.mjs` reads `Views/DotNetReport/Index.cshtml`, `Dashboard.cshtml`, `Views/DotNetSetup/Index.cshtml`, `Users.cshtml` and `_DotnetReportTemplatesPartial.cshtml` from the main app, strips the Razor, and writes `templates.ts`. Change the views, then run `npm run sync-templates`. The React package uses the same script.

## Building

Angular 22 needs Node 22.22.3 or newer (24 recommended).

```bash
npm install
npm run build:lib     # sync the templates, then build dist/dotnetreport-ng
```

## Running the demo

The demo serves on http://localhost:4200 and forwards `/api` and `/DotNetReport` to the .NET app at `https://localhost:52107` (see `projects/dotnetreport-app/proxy.conf.json`).

```bash
npm install ./dist/dotnetreport-ng --no-save   # use the library you just built
npx ng serve dotnetreport-app
```

Before a release is on npm, install the `dotnetreport` package from a local pack of the main app (`node npm/build.js`, then `npm pack` in `dist/npm`) so the demo gets the current scripts.

## Releasing

Set `<version>` in the main app's `.nuspec` files and push `net6/deploy/nuget`. The pipeline publishes the `dotnetreport` npm package first, then sets this package to the same version, builds it and publishes it.
