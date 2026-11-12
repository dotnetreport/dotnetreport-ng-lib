import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// The dotnetreport scripts read these globals, which the Razor views define
export function setDotnetReportGlobals(queryParams: { [key: string]: any }): void {
  const w = window as any;
  w.queryParams = { ...queryParams };
  w.toastr = w.toastr || { error: (msg: string) => window.alert(msg), success: (msg: string) => window.alert(msg) };
}

// The API's POST calls need an anti-forgery token, which the scripts read from this hidden input
export async function loadAntiForgeryToken(http: HttpClient, apiBaseUrl: string): Promise<void> {
  try {
    const result: any = await firstValueFrom(http.get(apiBaseUrl + '/DotNetReportApi/GetAntiForgeryToken', { withCredentials: true }));
    let input = document.querySelector('input[name="__RequestVerificationToken"]') as HTMLInputElement | null;
    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = '__RequestVerificationToken';
      document.body.appendChild(input);
    }
    input.value = result?.token || '';
  } catch {
    // older APIs don't have this endpoint
  }
}
