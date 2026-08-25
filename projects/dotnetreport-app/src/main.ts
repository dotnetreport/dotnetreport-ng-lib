import { provideZoneChangeDetection } from "@angular/core";
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { routes } from './app/app.routes';
import {provideDotNetReport} from 'dotnetreport-ng';
import { provideRouter } from '@angular/router';

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withXhr(), withInterceptorsFromDi()),
    ...provideDotNetReport('https://localhost:52107')
  ]
});
