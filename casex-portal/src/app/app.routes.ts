import { Routes } from '@angular/router';
import { PageComponent } from './pages/page/page.component';
import { IndexPageComponent } from './pages/index-page/index-page.component';

export const routes: Routes = [
  { path: '', component: IndexPageComponent },
  { path: 'demo', component: PageComponent },
];
