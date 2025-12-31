import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DotnetdashboardComponent, DotnetreportComponent, DotnetsetupComponent } from 'dotnetreport-ng';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,DotnetdashboardComponent,DotnetreportComponent,DotnetsetupComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'dotnetreport-app';
}
