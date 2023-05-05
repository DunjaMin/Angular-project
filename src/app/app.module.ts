import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { EquityOptionComponent } from './security/equity-option/equity-option.component';
import { EquityComponent } from './security/equity.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { SecuritySearchComponent } from './security-search/security-search.component';
import { SecurityService } from './security.service';

export const appRoutes: Routes = [

  { path: 'securitySearch', component: SecuritySearchComponent },
  { path: 'equity/:sid', component: EquityComponent },
  { path: 'equity', component: EquityComponent },
  { path: 'equityOption/:sid', component: EquityComponent },
  { path: 'equityOption', component: EquityComponent }, //TODO EquityOption
  { path: '', redirectTo: 'securitySearch', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }

];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SecuritySearchComponent,
    EquityComponent,
    PageNotFoundComponent,
    EquityOptionComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(appRoutes)
  ],
  exports: [RouterModule],
  providers: [
    SecurityService,
    DatePipe
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}


