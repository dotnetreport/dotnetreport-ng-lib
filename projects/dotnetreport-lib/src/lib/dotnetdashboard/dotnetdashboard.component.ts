import { DASHBOARD_PAGE, REPORT_TEMPLATES } from '../templates';
import { loadAntiForgeryToken, setDotnetReportGlobals } from '../globals';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BASE_URL_TOKEN } from '../dotnetreport-lib.di';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
declare var ko: any;
declare var dashboardViewModel: any;
declare var $: any;
declare var GridStack: any;
declare var _: any;

@Component({
  selector: 'app-dotnetdashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dotnetdashboard.component.html',
  styleUrls: ['./dotnetdashboard.component.css']
})
 

export class DotnetdashboardComponent implements OnInit, OnDestroy {
    private baseServiceUrl: string;
    public pageHtml: SafeHtml;
    private onResize: any;
    private queryParams: { [key: string]: string }={};
  public dateFormatPopoverContent: string = `
    <table class="table table-sm table-borderless mb-0" style="font-size:12px">
      <tr><td colspan="2" class="fw-bold text-primary border-bottom pb-1">Day</td></tr>
      <tr><td><code>d</code></td><td>1, 2 … 31</td></tr>
      <tr><td><code>dd</code></td><td>01, 02 … 31</td></tr>
      <tr><td><code>ddd</code></td><td>Mon, Tue …</td></tr>
      <tr><td><code>dddd</code></td><td>Monday, Tuesday …</td></tr>
      <tr><td colspan="2" class="fw-bold text-primary border-bottom pb-1 pt-2">Month</td></tr>
      <tr><td><code>M</code></td><td>1, 2 … 12</td></tr>
      <tr><td><code>MM</code></td><td>01, 02 … 12</td></tr>
      <tr><td><code>MMM</code></td><td>Jan, Feb …</td></tr>
      <tr><td><code>MMMM</code></td><td>January, February …</td></tr>
      <tr><td colspan="2" class="fw-bold text-primary border-bottom pb-1 pt-2">Year</td></tr>
      <tr><td><code>yy</code></td><td>26, 27 …</td></tr>
      <tr><td><code>yyyy</code></td><td>2026, 2027 …</td></tr>
      <tr><td colspan="2" class="fw-bold text-primary border-bottom pb-1 pt-2">Time</td></tr>
      <tr><td><code>h</code></td><td>1–12 (12hr)</td></tr>
      <tr><td><code>hh</code></td><td>01–12 (12hr)</td></tr>
      <tr><td><code>H</code></td><td>0–23 (24hr)</td></tr>
      <tr><td><code>HH</code></td><td>00–23 (24hr)</td></tr>
      <tr><td><code>mm</code></td><td>Minutes (00–59)</td></tr>
      <tr><td><code>ss</code></td><td>Seconds (00–59)</td></tr>
      <tr><td><code>tt</code></td><td>AM / PM</td></tr>
    </table>
    <div class="text-muted mt-1" style="font-size:11px">
      <b>Examples:</b> dd/MM/yyyy • MMM dd, yyyy • yyyy-MM-dd HH:mm
    </div>
  `;
    constructor(private sanitizer: DomSanitizer,
      private cdref: ChangeDetectorRef,
      @Inject(BASE_URL_TOKEN) private baseUrl: string,
      private http: HttpClient,
      private route: ActivatedRoute) {
        this.baseServiceUrl = this.baseUrl + '/api';
        this.pageHtml = '';
      }

    async ngOnInit() {
        const dashboards: any[] = [];
        const adminMode = localStorage.getItem('reportAdminMode') || 'false';
        const getUsersAndRolesUrl = this.baseServiceUrl + '/DotNetReportApi/GetUsersAndRoles';

        this.queryParams = this.route.snapshot.queryParams;
        setDotnetReportGlobals(this.queryParams);
        // the view model looks up its dialogs when it is created, so the page goes in first
        this.renderPage();

        await loadAntiForgeryToken(this.http, this.baseServiceUrl);
        this.http.get(this.baseServiceUrl + '/DotNetReportApi/GetDashboards?adminMode=' + adminMode).subscribe((dashboardData: any) => {
            if (dashboardData && dashboardData.noAccount === true) {
                $("#noaccountModal").modal('show');
                return;
            }
            (dashboardData || []).forEach((d: any) => {
                dashboards.push({ id: d.Id, name: d.Name, description: d.Description, selectedReports: d.SelectedReports, schedule: d.Schedule, userId: d.UserId, userRoles: d.UserRoles, viewOnlyUserId: d.ViewOnlyUserId, viewOnlyUserRoles: d.ViewOnlyUserRoles, clientId: d.ClientId, canManage: d.CanManage, displayOrder: d.DisplayOrder });
            });

            let dashboardId = parseInt(this.queryParams['id'] || '0');
            if (!dashboardId && dashboards.length > 0) { dashboardId = dashboards[0].id; }

            this.http.get(getUsersAndRolesUrl).subscribe((result: any) => {
                const vm = new dashboardViewModel({
                    runReportUrl: this.baseServiceUrl + '/DotNetReport/Report',
                    execReportUrl: this.baseServiceUrl + '/DotNetReportApi/RunReport',
                    runLinkReportUrl: this.baseServiceUrl + '/DotNetReportApi/RunReportLink',
                    lookupListUrl: this.baseServiceUrl + '/DotNetReportApi/GetLookupList',
                    apiUrl: this.baseServiceUrl + '/DotNetReportApi/CallReportApi',
                    runReportApiUrl: this.baseServiceUrl + '/DotNetReportApi/RunReportApi',
                    getSchemaFromSql: this.baseServiceUrl + '/DotNetReportApi/GetSchemaFromSql',
                    reportMode: "execute",
                    reportWizard: $("#modal-reportbuilder"),
                    linkModal: $("#linkModal"),
                    fieldOptionsModal: $("#fieldOptionsModal"),
                    dashboards: dashboards,
                    userSettings: result,
                    users: result.users,
                    userRoles: result.userRoles,
                    allowAdmin: result.allowAdminMode,
                    dataFilters: result.dataFilters,
                    dashboardId: dashboardId,
                    runExportUrl: this.baseServiceUrl + '/DotNetReportApi/',
                    printReportUrl: this.baseUrl + '/DotNetReport/ReportPrint',
                    loadSavedDashbordUrl: this.baseServiceUrl + '/DotNetReportApi/LoadSavedDashboard',
                    getDashbordsUrl: this.baseServiceUrl + '/DotNetReportApi/GetDashboards',
                    getTimeZonesUrl: this.baseServiceUrl + '/DotNetReportApi/GetAllTimezones',
                    previewEmailListUrl: this.baseServiceUrl + '/DotNetReportApi/PreviewEmailList',
                    getUsersAndRolesUrl: getUsersAndRolesUrl,
                    samePageOnRun: true
                });
                vm.dateFormatPopoverContent = this.dateFormatPopoverContent;
                vm.init().done(() => {
                    vm.loadDashboard(dashboardId).done(() => {
                        ko.applyBindings(vm, document.getElementById('dot-net-report'));
                        setTimeout(() => this.initGrid(vm), 10);
                    });
                    this.onResize = () => { vm.gridResponsive(); vm.drawChart(); };
                    window.addEventListener('resize', this.onResize);
                });
            });
        });
    }

    ngOnDestroy() {
        if (this.onResize) window.removeEventListener('resize', this.onResize);
        const el = document.getElementById('dot-net-report');
        if (el) ko.cleanNode(el);
    }

    public init() {
        this.ngOnInit();
    }

    private renderPage() {
        this.pageHtml = this.sanitizer.bypassSecurityTrustHtml(DASHBOARD_PAGE + '\n' + REPORT_TEMPLATES);
        this.cdref.detectChanges();
    }

    // Same grid setup as the Dashboard view; the live preview grid sets up its own
    private initGrid(vm: any): void {
        $('.grid-stack:not(.dash-preview-grid)').show();
        const grid = GridStack.init({
            cellHeight: 60,
            margin: 10,
            resizable: {
                handles: 'se, sw, ne, nw, n, e, s, w'
            },
            oneColumnSize: 768
        }, '.grid-stack:not(.dash-preview-grid)');

        grid.on('change', (event: any, items: any[]) => {
            if (!vm.arrangeDashboard() || !items) return;
            items.forEach((x: any) => {
                x.type = x.el.getAttribute("data-type");
                vm.updatePosition(x);
            });
        });

        grid.on('resizestop', (event: any, el: any) => {
            if (el && el.querySelector('.report-chart')) {
                vm.drawChart();
            }
        });

        setTimeout(() => {
            vm.drawChart();
            grid.enableMove(false);
            grid.enableResize(false);
            vm.gridResponsive();
        }, 1000);
    }
}
