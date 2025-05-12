import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-zona-user',
  imports: [RouterLink],
  templateUrl: './zona-user.component.html',
  styleUrl: './zona-user.component.css',
})
export class ZonaUserComponent implements OnInit {
  public user = {
    id: '',
    name: '',
    email: '',
    role: '',
  };
  constructor(private userService: UserService, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    const userId = this.authService.getUserInfo()?.sub;
    if (userId) {
      this.userService.obtenerUser(userId).subscribe({
        next: (userData) => {
          this.user = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role
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

  editarCampo(campo: string) {
    // Mostrar los botones de confirmar y cancelar
    const clase = 'editar-' + campo;
    const elements = document.getElementsByClassName(clase);
    for (let i = 0; i < elements.length; i++) {
      (elements[i] as HTMLElement).style.display = 'block';
    }

    // Ocultar el botón de editar el campo
    const buttonElement = document.getElementsByClassName(
      'boton-' + campo
    )[0] as HTMLElement;
    if (buttonElement) {
      buttonElement.style.display = 'none';
    }

    // Habilitar el input para editarlo
    const inputElement = document.getElementById(campo) as HTMLInputElement;
    if (inputElement) {
      inputElement.disabled = false;
      inputElement.focus();
    }
  }

  confirmarEdicion(campo: string) {
    // Obtener el valor del campo editado
    const campoElement = document.getElementById(campo) as HTMLInputElement;
    const nuevoValor = campoElement.value;

    // Check if the new value is different from the current value
    if (this.user[campo as keyof typeof this.user] === nuevoValor) {
      console.log(`No changes made to ${campo}`);
      return;
    } else {
      this.user[campo as keyof typeof this.user] = nuevoValor
    }

    this.userService.actualizarUser(this.user).subscribe({
      next: (data) => {
        console.log(data);
      },
      error: (error) => {
        console.error('Error al actualizar el usuario:', error);
      },
    });

    this.quitarEdicion(campo);
  }

  quitarEdicion(campo: string) {
    // Oculta los botones de confirmar y cancelar
    const clase = 'editar-' + campo;
    const elements = document.getElementsByClassName(clase);
    for (let i = 0; i < elements.length; i++) {
      (elements[i] as HTMLElement).style.display = 'none';
    }

    // Mostrar el botón de editar el campo
    const buttonElement = document.getElementsByClassName(
      'boton-' + campo
    )[0] as HTMLElement;
    if (buttonElement) {
      buttonElement.style.display = 'block';
    }

    // Deshabilitar el input para editarlo
    const inputElement = document.getElementById(campo) as HTMLInputElement;
    if (inputElement) {
      inputElement.disabled = true;
    }
  }
}
