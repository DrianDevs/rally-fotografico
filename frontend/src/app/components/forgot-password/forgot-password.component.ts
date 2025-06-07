import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  errorMessage: string = '';
  emailSent: boolean = false;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void { }

  onSubmit(): void {
    // Si el formulario es válido, procedemos a enviar el correo
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      const email = this.forgotPasswordForm.value.email;

      this.userService.forgotPassword(email).subscribe({
        next: (response) => {
          console.log(response);

          // Si lo recibido es FAIL, mostramos el mensaje de error
          if (response.result === 'FAIL') {
            this.errorMessage = response.message || 'Error al procesar la solicitud';
            this.isLoading = false;
            return;
          }

          this.emailSent = true;
          this.isLoading = false;
        },
        error: (error) => {
          console.log('Error al enviar el correo electrónico:', error);
          this.isLoading = false;
          this.errorMessage = 'Ha habido un error al enviar el correo electrónico. Por favor, inténtalo de nuevo más tarde.';
        },
      });
    }
  }

  // Reinicia el formulario y el mensaje de error
  resetForm(): void {
    this.emailSent = false;
    this.errorMessage = '';
    this.forgotPasswordForm.reset();
  }
}
