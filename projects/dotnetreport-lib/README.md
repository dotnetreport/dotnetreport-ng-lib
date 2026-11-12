# dotnetreport-ng

Angular components for [Dotnet Report](https://dotnetreport.com), the embedded ad hoc reporting and dashboard builder for ASP.NET. Put the Report Designer, Dashboards, Setup and Users & Access screens inside your Angular app while your .NET backend serves the API.

![Report Builder](https://dotnetreport.com/wp-content/uploads/2021/12/mk-7-1024x775.png)

- List, summary, pivot and chart reports (bar, line, pie, map, gauge, funnel and more) with filtering, grouping and totals
- Dashboards with drag-and-drop tiles and a live preview while editing
- Export to Excel, PDF, Word and CSV, and scheduled email delivery
- Users, roles, tenants and permissions, without giving anyone full admin rights

Full guide: **[Install with Angular](https://dotnetreport.com/docs/#installation-angular)** in the knowledge base.

## Requirements

- Angular 19 to 22
- An ASP.NET Core backend with the [`dotnetreport`](https://www.nuget.org/packages/dotnetreport/) or [`dotnetreport.backend`](https://www.nuget.org/packages/dotnetreport.backend/) NuGet package **at the same version** as this package

## 1. Install

```bash
npm install dotnetreport-ng dotnetreport
```

The [`dotnetreport`](https://www.npmjs.com/package/dotnetreport) package has the report scripts and installs every library they use (jQuery, Knockout, ECharts, Bootstrap and the rest) at tested versions. Keep both packages on the same version as your backend.

## 2. Add the scripts and styles to `angular.json`

This package contains the components only. `dotnetreport.js` and the libraries are classic global scripts, so add them to `projects.<app>.architect.build.options` in this order:

```json
"styles": [
  "node_modules/bootstrap/dist/css/bootstrap.min.css",
  "node_modules/@fortawesome/fontawesome-free/css/all.min.css",
  "node_modules/@fortawesome/fontawesome-free/css/v4-shims.min.css",
  "node_modules/@fortawesome/fontawesome-free/css/v4-font-face.min.css",
  "node_modules/bootstrap-datepicker/dist/css/bootstrap-datepicker.min.css",
  "node_modules/select2/dist/css/select2.min.css",
  "node_modules/dotnetreport/src/dotnetreport.css",
  "node_modules/gridstack/dist/gridstack.min.css",
  "node_modules/tributejs/dist/tribute.css",
  "node_modules/summernote/dist/summernote-bs5.min.css",
  "node_modules/leaflet/dist/leaflet.css",
  "node_modules/x-editable-bs4/dist/bootstrap4-editable/css/bootstrap-editable.css"
],
"scripts": [
  "node_modules/jquery/dist/jquery.min.js",
  "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js",
  "node_modules/summernote/dist/summernote-bs5.min.js",
  "node_modules/leaflet/dist/leaflet.js",
  "node_modules/echarts/dist/echarts.min.js",
  "node_modules/leaflet.heat/dist/leaflet-heat.js",
  "node_modules/knockout/build/output/knockout-latest.js",
  "node_modules/jquery-blockui/jquery.blockUI.js",
  "node_modules/bootbox/dist/bootbox.min.js",
  "node_modules/bootstrap-datepicker/dist/js/bootstrap-datepicker.min.js",
  "node_modules/jquery-ui-dist/jquery-ui.min.js",
  "node_modules/knockout-sortable/build/knockout-sortable.min.js",
  "node_modules/select2/dist/js/select2.min.js",
  "node_modules/lodash/lodash.min.js",
  "node_modules/tributejs/dist/tribute.min.js",
  "node_modules/knockout-mapping/dist/knockout.mapping.js",
  "node_modules/x-editable-bs4/dist/bootstrap4-editable/js/bootstrap-editable.min.js",
  "node_modules/knockout-x-editable/knockout.x-editable.min.js",
  "node_modules/dotnetreport/src/dotnetreport.js",
  "node_modules/dotnetreport/src/dotnetreport-helper.js",
  "node_modules/dotnetreport/src/dotnetreport-setup.js",
  "node_modules/dotnetreport/src/dotnetreport-users.js",
  "node_modules/gridstack/dist/gridstack-all.js"
]
```

Restart `ng serve` after changing `angular.json`. A `<script>` tag in a component template or an `import` of these libraries will not work: they must be globals.

## 3. Register the backend URL

```ts
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideDotNetReport } from 'dotnetreport-ng';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    ...provideDotNetReport('https://localhost:7001')
  ]
};
```

Pass your backend's origin with no trailing slash; the components call `{baseUrl}/api/DotNetReportApi/...`. Use `''` when the API is on the same origin or behind a dev-server proxy.

## 4. Add the components to your routes

```ts
import { DotnetreportComponent, DotnetdashboardComponent, DotnetsetupComponent, DotnetusersComponent } from 'dotnetreport-ng';

export const routes: Routes = [
  { path: 'reports', component: DotnetreportComponent },      // <app-dotnetreport>
  { path: 'dashboard', component: DotnetdashboardComponent },  // <app-dotnetdashboard>
  { path: 'setup', component: DotnetsetupComponent },          // <app-dotnetsetup>
  { path: 'users', component: DotnetusersComponent },          // <app-dotnetusers>, Users & Access
];
```

The components read the same query-string parameters as the .NET pages: `?reportId=`, `?folderid=`, `?id=` (dashboard), `?databaseApiKey=` and `?onlyApi=`.

## Backend

- **Anti-forgery token.** The API's POST calls check an anti-forgery token. The components get one from `GET /api/DotNetReportApi/GetAntiForgeryToken`, added in the 6.4.0 backend, so upgrade the backend with this package. With an older backend, running and saving reports fails with `400 Bad Request`.
- **Same origin is simplest.** In development, proxy `/api` to the backend with a `proxy.conf.json` and pass `''` as the base URL.
- **Different origins.** Allow your front end's exact origin on the API with `AllowCredentials()`, set the anti-forgery cookie to `SameSite=None` and `Secure`, and add `$.ajaxSetup({ xhrFields: { withCredentials: true } })` to `main.ts`. Never allow any origin together with credentials.

## Upgrading to 6.4.0

- Add `dotnetreport-users.js` to `scripts`.
- Replace the old `font-awesome` 4.7 stylesheet with the three `@fortawesome/fontawesome-free` files above.
- Add a route for `DotnetusersComponent`. Users & Roles is no longer a tab in Setup.
- Upgrade the backend at the same time, for the anti-forgery token endpoint.

## Troubleshooting

| Error | Fix |
|---|---|
| `echarts is not defined`, `reportViewModel is not defined`, `ko is not defined` ... | A script is missing from `angular.json` (see step 2) |
| `usersAccessViewModel is not defined` | Add `dotnetreport-users.js` to `scripts` |
| `400 Bad Request` when running or saving a report | No anti-forgery token: upgrade the backend to 6.4.0, and see "Different origins" above |
| Icons show as empty boxes | Add the Font Awesome styles from step 2 |

More in the [knowledge base](https://dotnetreport.com/docs/#installation-angular).

## License

Dotnet Report is licensed under [LGPL](https://github.com/dotnetreport/ReportBuilder.Web/blob/master/LICENSE) and EULA.
