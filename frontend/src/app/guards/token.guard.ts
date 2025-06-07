import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, catchError, of } from 'rxjs';

// Protege el formulario de reestablecer contraseña de usuarios sin token o con token inválido
export const tokenGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const token = route.paramMap.get('token');

    // Si no trae token, redirigir al login
    if (!token) {
        router.navigate(['/login']);
        return false;
    }

    // Verificar si el token recibido es válido
    return authService.verificarTokenPassword(token).pipe(
        map((response) => {
            // Si la respuesta es exitosa, el token es válido
            if (response.result === 'OK' && response.valid === true) {
                return true;
            } else {
                router.navigate(['/login']);
                return false;
            }
        }),
        catchError((error) => {
            // En caso de error, redirigir al login
            console.error('Error validating token:', error);
            router.navigate(['/login']);
            return of(false);
        })
    );
};