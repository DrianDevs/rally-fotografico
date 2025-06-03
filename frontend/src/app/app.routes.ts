import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ZonaUserComponent } from './components/zona-user/zona-user.component';
import { ZonaAdminComponent } from './components/zona-admin/zona-admin.component';
import { MainComponent } from './components/main/main.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { tokenGuard } from './guards/token.guard';

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
  }, {
    path: 'signup',
    loadComponent: () =>
      import('./components/signup/signup.component').then(
        (m) => m.SignupComponent
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./components/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      ),
  }, {
    path: 'reset-password/:token',
    loadComponent: () =>
      import('./components/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
    canActivate: [tokenGuard],
  },
  {
    path: 'estadisticas',
    loadComponent: () =>
      import('./components/stats/stats.component').then(
        (m) => m.StatsComponent
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
  {
    path: 'subir-foto',
    loadComponent: () =>
      import('./components/upload-photo/upload-photo.component').then(
        (m) => m.UploadPhotoComponent
      ),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '' },
];
