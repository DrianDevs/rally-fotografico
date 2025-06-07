import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Protege la zona privada de administrador de usuarios no administradores
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const role = authService.getUserRole();

  if (role === 'admin') return true; // Si es administrador, devolver true

  // Si no, redirige al login y devuelve false
  router.navigate(['/login']);
  return false;
};
