import { SETUP_PAGE, SETUP_TEMPLATES } from '../templates';
import { loadAntiForgeryToken, setDotnetReportGlobals } from '../globals';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BASE_URL_TOKEN } from './../dotnetreport-lib.di';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

declare var ko: any;
declare var manageViewModel: any;
declare var $: any;

@Component({
  selector: 'app-dotnetsetup',
  templateUrl: './dotnetsetup.component.html',
  standalone: true,
  imports: [ CommonModule],
  styleUrls: ['./dotnetsetup.component.css']
})

export class DotnetsetupComponent implements OnInit, OnDestroy {
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
    const api = this.baseServiceUrl + '/DotNetReportApi/';
    const loadSetupSchemaUrl = api + 'LoadSetupSchema';
    this.queryParams = this.route.snapshot.queryParams;
    setDotnetReportGlobals(this.queryParams);
    const databaseApiKey = this.queryParams['databaseApiKey'] || '';
    const onlyApi = this.queryParams['onlyApi'] !== 'false';
    if ($.fn.editable) $.fn.editable.defaults.mode = 'inline';
    this.renderPage();

    await loadAntiForgeryToken(this.http, this.baseServiceUrl);
    this.http.get(loadSetupSchemaUrl + '?databaseApiKey=' + databaseApiKey + '&onlyApi=' + onlyApi).subscribe((model: any) => {
        const options = {
            model: model,
            saveTableUrl: '/ReportApi/SaveTableData',
            deleteTableUrl: '/ReportApi/DeleteTable',
            getRelationsUrl: '/ReportApi/GetRelations',
            getDataConnectionsUrl: '/ReportApi/GetDataConnections',
            updateDataConnectionUrl: '/ReportApi/UpdateDataConnection',
            saveRelationsUrl: '/ReportApi/SaveRelationsData',
            addDataConnectionUrl: '/ReportApi/AddDataConnection',
            saveProcUrl: '/ReportApi/SaveProcedureData',
            deleteProcUrl: '/ReportApi/DeleteProcedure',
            saveCustomFuncUrl: '/ReportApi/SaveCustomFunctionData',
            deleteCustomFuncUrl: '/ReportApi/DeleteCustomFunction',
            getSchedulesUrl: '/ReportApi/GetScheduledReportsAndDashboards',
            deleteScheduleUrl: '/ReportApi/DeleteSchedule',
            saveCategoriesUrl: '/ReportApi/SaveCategoriesData',
            getCategoriesUrl: '/ReportApi/GetCategories',
            getEmailQueriesUrl: '/ReportApi/GetDataDrivenQueries',
            saveEmailQueryUrl: '/ReportApi/SaveDataDrivenQuery',
            deleteEmailQueryUrl: '/ReportApi/DeleteDataDrivenQuery',
            previewEmailListUrl: api + 'PreviewEmailList',
            getAppSettingUrl: '/ReportApi/GetAccountSettings',
            saveAppSettingUrl: '/ReportApi/ChangeAccountSettings',
            updateDbConnectionUrl: api + 'UpdateDbConnection',
            sendTestEmailUrl: api + 'SendTestEmail',
            getEmailSettingsUrl: api + 'GetEmailSettings',
            saveEmailSettingsUrl: api + 'SaveEmailSettings',
            switchWorkspaceUrl: api + 'SwitchWorkspace',
            reportsApiUrl: api + 'CallReportApi',
            runReportApiUrl: api + 'RunReportApi',
            getUsersAndRoles: api + 'GetUsersAndRoles',
            sendPasswordSetupUrl: api + 'SendUserPasswordSetup',
            searchProcUrl: api + 'SearchProcedure',
            getDatabaseRelationsUrl: api + 'GetDatabaseRelations',
            getTimeZonesUrl: api + 'GetAllTimezones',
            getSchemaFromSql: api + 'GetSchemaFromSql',
            apiUrl: api + 'CallPostReportApi',
            getPreviewFromSqlUrl: api + 'GetPreviewFromSql',
            onlyApi: onlyApi,
            loadSchemaUrl: loadSetupSchemaUrl,
            buildDynamicFunctionsUrl: api + 'BuildDynamicFunctions',
            currentUserId: model.CurrentUserId
        };

        const vm = new manageViewModel(options);
        vm.dateFormatPopoverContent = this.dateFormatPopoverContent;
        vm.LoadJoins();
        vm.setupManageAccess();
        vm.LoadSchedules();
        vm.LoadCategories();
        ko.applyBindings(vm, document.getElementById('dot-net-report'));
        vm.LoadDataConnections();
        vm.customSql.textQuery.setupQuery();
    });
  }

  ngOnDestroy() {
    const el = document.getElementById('dot-net-report');
    if (el) ko.cleanNode(el);
  }

  public init() {
    this.ngOnInit();
  }

  private renderPage() {
    this.pageHtml = this.sanitizer.bypassSecurityTrustHtml(SETUP_PAGE + '\n' + SETUP_TEMPLATES);
    this.cdref.detectChanges();
  }
}
