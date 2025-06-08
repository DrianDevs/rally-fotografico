import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { MyPhotosComponent } from "../my-photos/my-photos.component";

@Component({
  selector: 'app-zona-user',
  imports: [MyPhotosComponent],
  templateUrl: './zona-user.component.html',
  styleUrl: './zona-user.component.css',
})
export class ZonaUserComponent implements OnInit {
  public user = {
    id: '',
    name: '',
    email: '',
    role: '',
    password: '',
  };
  constructor(private userService: UserService, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    const userId = this.authService.getUserInfo()?.sub;
    if (userId) {
      this.userService.obtenerUser(userId).subscribe({
        next: (userData) => {
          console.log(userData);
          this.user = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            password: '',
          };
        },
        error: (error) => {
          console.error('Error fetching user data:', error);
        }
      });
    }

    // Oculta los botones dentro de las clases "editar-name", "editar-password" and "editar-email"
    const editableClasses = [
      'editar-name',
      'editar-password',
      'editar-email',
    ];
    editableClasses.forEach((className) => {
      const elements = document.getElementsByClassName(className);
      for (let i = 0; i < elements.length; i++) {
        (elements[i] as HTMLElement).style.display = 'none';
      }
    });
  }

  editField(field: string) {
    // Mostrar los botones de confirmar y cancelar
    const className = 'editar-' + field;
    const elements = document.getElementsByClassName(className);
    for (let i = 0; i < elements.length; i++) {
      (elements[i] as HTMLElement).style.display = 'block';
    }

    // Ocultar el botón de editar el campo
    const buttonElement = document.getElementsByClassName(
      'boton-' + field
    )[0] as HTMLElement;
    if (buttonElement) {
      buttonElement.style.display = 'none';
    }

    // Habilitar el input para editarlo
    const inputElement = document.getElementById(field) as HTMLInputElement;
    if (inputElement) {
      inputElement.disabled = false;
      inputElement.focus();
    }
  }

  submitEdit(field: string) {
    // Obtener el valor del campo editado
    const fieldElement = document.getElementById(field) as HTMLInputElement;
    const nuevoValor = fieldElement.value;


    // Si el campo editado es la contraseña, se llama a un servicio dedicado por seguridad
    if (field === 'password') {
      // Validar que la contraseña tenga al menos 6 caracteres
      if (nuevoValor.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
      }

      this.userService.actualizarPassword(this.user.id, nuevoValor).subscribe({
        next: (data) => {
          console.log("Contraseña actualizada con éxito:", data);
        },
        error: (error) => {
          console.error('Error al actualizar la contraseña:', error);
        },
      });

      this.cancelEdit(field);
      return;
    }


    // Comprobar si el nuevo valor es igual al valor anterior (name y email)
    if (this.user[field as keyof typeof this.user] === nuevoValor) {
      console.log(`El ${field} es igual al anterior.`);
      return;
    } else {
      this.user[field as keyof typeof this.user] = nuevoValor
    }

    this.userService.actualizarUser(this.user).subscribe({
      next: (data) => {
        console.log("Datos del usuario actualizados con éxito:", data);
      },
      error: (error) => {
        console.error('Error al actualizar el usuario:', error);
      },
    });

    this.cancelEdit(field);
  }

  cancelEdit(field: string) {
    // Oculta los botones de confirmar y cancelar
    const className = 'editar-' + field;
    const elements = document.getElementsByClassName(className);
    for (let i = 0; i < elements.length; i++) {
      (elements[i] as HTMLElement).style.display = 'none';
    }

    // Mostrar el botón de editar el campo
    const buttonElement = document.getElementsByClassName(
      'boton-' + field
    )[0] as HTMLElement;
    if (buttonElement) {
      buttonElement.style.display = 'block';
    }

    // Deshabilitar el input y restaurar el valor original
    const inputElement = document.getElementById(field) as HTMLInputElement;
    if (inputElement) {
      inputElement.disabled = true;
      // Restaurar el valor original del campo
      inputElement.value = this.user[field as keyof typeof this.user] as string;
    }
  }
}
