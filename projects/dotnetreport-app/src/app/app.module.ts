import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { DotnetReportModule } from 'dotnetreport-ng';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


@NgModule({ declarations: [
        AppComponent
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        DotnetReportModule.forRoot('https://localhost:52107')], 
        providers: [provideHttpClient(withInterceptorsFromDi())] })
export class AppModule { }
