import { Routes } from '@angular/router';
import { DotnetdashboardComponent, DotnetreportComponent, DotnetsetupComponent, DotnetusersComponent } from 'dotnetreport-ng';

export const routes: Routes = [
  { path: '', component: DotnetreportComponent },
  { path: 'dashboard', component: DotnetdashboardComponent },
  { path: 'setup', component: DotnetsetupComponent },
  { path: 'users', component: DotnetusersComponent },
];
