import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  token: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  passwordReset: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';
  }

  get passwordsMatch(): boolean {
    const password = this.resetPasswordForm.get('password')?.value;
    const confirmPassword = this.resetPasswordForm.get('confirmPassword')?.value;
    return password === confirmPassword;
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid && this.passwordsMatch) {
      this.isLoading = true;
      this.errorMessage = '';

      const password = this.resetPasswordForm.get('password')?.value;

      this.userService.resetPassword(this.token, password).subscribe({
        next: (response) => {
          if (response.success) {
            this.passwordReset = true;
            // Redirigir al login después de 3 segundos
            setTimeout(() => {
              this.navigateToLogin();
            }, 3000);
          } else {
            this.errorMessage = response.message || 'Error al restablecer la contraseña';
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al restablecer la contraseña:', error);
          this.errorMessage = 'Error al restablecer la contraseña. Inténtalo de nuevo.';
          this.isLoading = false;
        }
      });
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }
}