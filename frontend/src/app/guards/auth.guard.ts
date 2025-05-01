import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// authGuard: Protege las zonas privadas de usuarios sin logear,
// es un guard generico que sirve como primer filtro de seguridad
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) return true; // Si esta logueado, devuelve true

  // Si no, redirige al login y devuelve false
  router.navigate(['/login']);
  return false;
};
