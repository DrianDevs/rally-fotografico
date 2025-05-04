import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ZonaUserComponent } from './components/zona-user/zona-user.component';
import { ZonaAdminComponent } from './components/zona-admin/zona-admin.component';
import { MainComponent } from './components/main/main.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/main/main.component').then((m) => m.MainComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./components/zona-admin/zona-admin.component').then(
        (m) => m.ZonaAdminComponent
      ),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'participante',
    loadComponent: () =>
      import('./components/zona-user/zona-user.component').then(
        (m) => m.ZonaUserComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'lista-usuarios',
    loadComponent: () =>
      import('./components/lista-users/lista-users.component').then(
        (m) => m.ListaUsersComponent
      ),
    canActivate: [authGuard, adminGuard],
  },
  { path: '**', redirectTo: '' },
];
