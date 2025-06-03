// Ejemplo de servicio Angular para recuperación de contraseña

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PasswordResetService {
    private apiUrl = 'http://localhost/rally-fotografico/backend/src/users.php';

    constructor(private http: HttpClient) { }

    // Solicitar recuperación de contraseña
    forgotPassword(email: string): Observable<any> {
        return this.http.post(this.apiUrl, {
            servicio: 'forgotPassword',
            email: email
        });
    }

    // Validar token de recuperación
    validateResetToken(token: string): Observable<any> {
        return this.http.post(this.apiUrl, {
            servicio: 'validateResetToken',
            token: token
        });
    }

    // Restablecer contraseña
    resetPassword(token: string, password: string): Observable<any> {
        return this.http.post(this.apiUrl, {
            servicio: 'resetPassword',
            token: token,
            password: password
        });
    }
}

// Ejemplo de componente para solicitar recuperación
export class ForgotPasswordComponent {
    email: string = '';
    message: string = '';
    isLoading: boolean = false;

    constructor(private passwordResetService: PasswordResetService) { }

    onSubmit() {
        if (!this.email) {
            this.message = 'Por favor ingresa tu correo electrónico';
            return;
        }

        this.isLoading = true;
        this.passwordResetService.forgotPassword(this.email).subscribe({
            next: (response) => {
                this.isLoading = false;
                if (response.result === 'OK') {
                    this.message = response.message;
                } else {
                    this.message = response.message || 'Error al procesar la solicitud';
                }
            },
            error: (error) => {
                this.isLoading = false;
                this.message = 'Error de conexión. Inténtalo de nuevo más tarde.';
                console.error('Error:', error);
            }
        });
    }
}

// Ejemplo de componente para restablecer contraseña
export class ResetPasswordComponent implements OnInit {
    token: string = '';
    password: string = '';
    confirmPassword: string = '';
    message: string = '';
    isLoading: boolean = false;
    tokenValid: boolean = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private passwordResetService: PasswordResetService
    ) { }

    ngOnInit() {
        // Obtener token de los parámetros de la URL
        this.token = this.route.snapshot.queryParams['token'];

        if (this.token) {
            this.validateToken();
        } else {
            this.message = 'Token de recuperación no válido';
        }
    }

    validateToken() {
        this.passwordResetService.validateResetToken(this.token).subscribe({
            next: (response) => {
                if (response.result === 'OK') {
                    this.tokenValid = true;
                } else {
                    this.message = response.message || 'Token inválido o expirado';
                }
            },
            error: (error) => {
                this.message = 'Error al validar el token';
                console.error('Error:', error);
            }
        });
    }

    onSubmit() {
        if (this.password !== this.confirmPassword) {
            this.message = 'Las contraseñas no coinciden';
            return;
        }

        if (this.password.length < 6) {
            this.message = 'La contraseña debe tener al menos 6 caracteres';
            return;
        }

        this.isLoading = true;
        this.passwordResetService.resetPassword(this.token, this.password).subscribe({
            next: (response) => {
                this.isLoading = false;
                if (response.result === 'OK') {
                    this.message = response.message;
                    // Redirigir al login después de 3 segundos
                    setTimeout(() => {
                        this.router.navigate(['/login']);
                    }, 3000);
                } else {
                    this.message = response.message || 'Error al restablecer la contraseña';
                }
            },
            error: (error) => {
                this.isLoading = false;
                this.message = 'Error de conexión. Inténtalo de nuevo más tarde.';
                console.error('Error:', error);
            }
        });
    }
}
