import { USERS_PAGE } from '../templates';
import { loadAntiForgeryToken, setDotnetReportGlobals } from '../globals';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BASE_URL_TOKEN } from '../dotnetreport-lib.di';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

declare var ko: any;
declare var usersAccessViewModel: any;

// The Users & Access page: users, roles and tenants, and the permissions given to them
@Component({
  selector: 'app-dotnetusers',
  templateUrl: './dotnetusers.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class DotnetusersComponent implements OnInit, OnDestroy {
  private baseServiceUrl: string;
  public pageHtml: SafeHtml;

  constructor(private sanitizer: DomSanitizer,
    private cdref: ChangeDetectorRef,
    @Inject(BASE_URL_TOKEN) private baseUrl: string,
    private http: HttpClient,
    private route: ActivatedRoute) {
      this.baseServiceUrl = this.baseUrl + '/api';
      this.pageHtml = '';
    }

  async ngOnInit() {
    setDotnetReportGlobals(this.route.snapshot.queryParams);
    this.pageHtml = this.sanitizer.bypassSecurityTrustHtml(USERS_PAGE);
    this.cdref.detectChanges();

    await loadAntiForgeryToken(this.http, this.baseServiceUrl);
    this.http.get(this.baseServiceUrl + '/DotNetReportApi/GetUsersAndRoles').subscribe((data: any) => {
      if (data && data.d) data = data.d;
      const vm = new usersAccessViewModel({
        userSettings: data,
        apiUrl: this.baseServiceUrl + '/DotNetReportApi/CallPostReportApi',
        getPreviewFromSqlUrl: this.baseServiceUrl + '/DotNetReportApi/GetPreviewFromSql'
      });
      ko.applyBindings(vm, document.getElementById('users-access'));
      vm.init();
    });
  }

  ngOnDestroy() {
    const el = document.getElementById('users-access');
    if (el) ko.cleanNode(el);
  }

  public init() {
    this.ngOnInit();
  }
}
