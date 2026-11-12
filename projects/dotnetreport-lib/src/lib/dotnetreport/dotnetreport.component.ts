import { REPORT_PAGE, REPORT_TEMPLATES } from '../templates';
import { loadAntiForgeryToken, setDotnetReportGlobals } from '../globals';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BASE_URL_TOKEN } from './../dotnetreport-lib.di';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

declare var ko: any;
declare var reportViewModel: any;
declare var $: any;

@Component({
  selector: 'app-dotnetreport',
  templateUrl: './dotnetreport.component.html',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./dotnetreport.component.css']
})
 

export class DotnetreportComponent implements OnInit, OnDestroy {
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
      this.queryParams = this.route.snapshot.queryParams;
      setDotnetReportGlobals(this.queryParams);
      // the view model looks up its dialogs when it is created, so the page goes in first
      this.renderPage();

      await loadAntiForgeryToken(this.http, this.baseServiceUrl);
      this.http.get(this.baseServiceUrl + '/DotNetReportApi/GetUsersAndRoles').subscribe((result: any) => {
          const vm = new reportViewModel({
              runReportUrl: this.baseServiceUrl + '/DotNetReport/Report',
              reportWizard: $("#modal-reportbuilder"),
              execReportUrl: this.baseServiceUrl + '/DotNetReportApi/RunReport',
              runLinkReportUrl: this.baseServiceUrl + '/DotNetReportApi/RunReportLink',
              getSchemaFromSql: this.baseServiceUrl + '/DotNetReportApi/GetSchemaFromSql',
              linkModal: $("#linkModal"),
              reportHeader: "report-header",
              fieldOptionsModal: $("#fieldOptionsModal"),
              lookupListUrl: this.baseServiceUrl + '/DotNetReportApi/GetLookupList',
              apiUrl: this.baseServiceUrl + '/DotNetReportApi/CallReportApi',
              runReportApiUrl: this.baseServiceUrl + '/DotNetReportApi/RunReportApi',
              getUsersAndRolesUrl: this.baseServiceUrl + '/DotNetReportApi/GetUsersAndRoles',
              reportId: this.queryParams["reportId"] || 0,
              userSettings: result,
              dataFilters: result.dataFilters,
              runExportUrl: this.baseServiceUrl + '/DotNetReportApi/',
              getTimeZonesUrl: this.baseServiceUrl + '/DotNetReportApi/GetAllTimezones',
              previewEmailListUrl: this.baseServiceUrl + '/DotNetReportApi/PreviewEmailList',
              printReportUrl: this.baseUrl + '/DotNetReport/ReportPrint',
              samePageOnRun: true,
              reportMode: this.queryParams["linkedreport"] == "true" ? "linked" : ""
          });
          vm.dateFormatPopoverContent = this.dateFormatPopoverContent;
          vm.init(this.queryParams["folderid"] || 0, result.noAccount, this.queryParams["reportId"] || 0);
          ko.applyBindings(vm, document.getElementById('dot-net-report'));
          vm.textQuery.setupSearch();

          this.onResize = () => vm.DrawChart();
          $(window).on('resize', this.onResize);
      });
    }

    ngOnDestroy() {
      if (this.onResize) $(window).off('resize', this.onResize);
      const el = document.getElementById('dot-net-report');
      if (el) ko.cleanNode(el);
    }

    public init() {
      this.ngOnInit();
    }

    private renderPage() {
      this.pageHtml = this.sanitizer.bypassSecurityTrustHtml(REPORT_PAGE + '\n' + REPORT_TEMPLATES);
      this.cdref.detectChanges();
    }
}
