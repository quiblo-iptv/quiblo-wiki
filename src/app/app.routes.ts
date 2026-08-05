import { Routes } from '@angular/router';
import { ApiHomeComponent } from './api/pages/api-home';
import { ApiPackageComponent } from './api/pages/api-package';
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
  // The code reference is its own destination as well as a section of the wiki: /api is
  // the page someone looking for a class opens directly.
  { path: 'api', component: ApiHomeComponent, title: 'Quiblo code reference' },
  {
    path: 'api/:id',
    component: ApiPackageComponent,
    title: 'Quiblo code reference',
  },
  { path: '**', redirectTo: '' },
];
