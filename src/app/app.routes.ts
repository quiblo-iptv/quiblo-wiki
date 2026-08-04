import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home';
import { WikiPageComponent } from './pages/wiki-page';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Quiblo wiki' },
  {
    // The `:slug` segment binds to the component's `slug` input, so moving between pages
    // updates in place rather than tearing the component down and rebuilding it.
    path: 'wiki/:slug',
    component: WikiPageComponent,
    title: 'Quiblo wiki',
  },
  { path: '**', redirectTo: '' },
];
