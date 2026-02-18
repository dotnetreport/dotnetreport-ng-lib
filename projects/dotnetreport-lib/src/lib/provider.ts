import { Provider } from '@angular/core';
import { BASE_URL_TOKEN } from './dotnetreport-lib.di';

export function provideDotNetReport(baseUrl: string): Provider[] {
  return [
    {
      provide: BASE_URL_TOKEN,
      useValue: baseUrl
    }
  ];
}
