import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app/app.component';
import { provideRouter, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'weather' },
  {
    path: 'weather',
    loadComponent: () =>
      import('./app/features/weather/pages/search-page/search-page.component')
        .then(m => m.SearchPageComponent),
  },
];

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    importProvidersFrom(FormsModule),
    provideRouter(routes),
  ],
}).catch(err => console.error(err));
