import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lista-users',
  imports: [RouterLink, FormsModule],
  templateUrl: './lista-users.component.html',
  styleUrl: './lista-users.component.css',
})
export class ListaUsersComponent {
  public users: User[] = [];
  public showEditForm: boolean = false;
  public selectedUser: User | null = null;
  public formModified: boolean = false;
  private originalUser: User | null = null;

  constructor(private peticion: UserService) {
    this.peticion.obtenerUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (error) => {
        console.error('Error al cargar la configuración:', error);
      },
    });
  }

  eliminarUser(userId: number) {
    if (!confirm('¿Está seguro que desea eliminar este usuario?')) return;

    this.peticion.eliminarUser(userId).subscribe({
      next: (response) => {
        this.peticion.obtenerUsers().subscribe({
          next: (data) => {
            this.users = data;
          },
        });
      },
      error: (error) => {
        console.error('Error al eliminar un usuario:', error);
      },
    });
  }

  modificarUser(userId: number) {
    const userToEdit = this.users.find((user) => user.id === userId);
    if (userToEdit) {
      // Crear una copia del usuario por si la edición es cancelada
      this.originalUser = { ...userToEdit };
      this.selectedUser = { ...userToEdit };
      this.showEditForm = true;
      this.formModified = false;
    }
  }

  onFormChange() {
    this.formModified = true;
  }

  guardarCambios() {
    if (
      !this.selectedUser ||
      !this.originalUser ||
      this.originalUser.role === 'admin'
    ) {
      // La aplicación no permite bajar de rango a un administrador
      alert('No se puede modificar un usuario administrador o vacío.');
    } else {
      this.peticion.actualizarUser(this.selectedUser).subscribe({
        next: (response: any) => {
          this.showEditForm = false;
          this.selectedUser = null;
          this.originalUser = null;
          this.formModified = false;

          this.peticion.obtenerUsers().subscribe({
            next: (data) => {
              this.users = data;
            },
          });
        },
        error: (error: any) => {
          console.error('Error al actualizar el usuario:', error);
        },
      });
    }
  }

  cancelarEdicion() {
    if (this.originalUser && this.selectedUser) {
      const index = this.users.findIndex(
        (user) => user.id === this.originalUser!.id
      );
      if (index !== -1) {
        this.users[index] = { ...this.originalUser };
      }
    }
    this.showEditForm = false;
    this.selectedUser = null;
    this.originalUser = null;
    this.formModified = false;
  }
}
