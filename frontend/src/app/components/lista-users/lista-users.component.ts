import { Component, OnInit } from '@angular/core';
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
export class ListaUsersComponent implements OnInit {
  public users: User[] = [];
  public showEditForm: boolean = false;
  public selectedUser: User | null = null;
  public formModified: boolean = false;
  private originalUser: User | null = null;

  constructor(private peticion: UserService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  // Carga todos los usuarios desde el backend
  loadUsers() {
    this.peticion.obtenerUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (error) => {
        console.error('Error al cargar los usuarios:', error);
      },
    });
  }

  // Elimina un usuario después de la confirmación
  eliminarUser(userId: number) {
    const userToDelete = this.users.find((user) => user.id === userId);

    // Prevenir eliminación de usuarios admins
    if (userToDelete?.role === 'admin') {
      alert('No se puede eliminar un usuario administrador.');
      return;
    }

    if (!confirm('¿Está seguro que desea eliminar este usuario?')) return;

    this.peticion.eliminarUser(userId).subscribe({
      next: (response) => {
        console.log(response);
        this.loadUsers(); // Recargar la lista después de eliminar
      },
      error: (error) => {
        console.error('Error al eliminar un usuario:', error);
      },
    });
  }

  // Prepara un usuario para ser editado abriendo el formulario
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

  // Marca el formulario como modificado
  onFormChange() {
    this.formModified = true;
  }

  // Guarda los cambios realizados en un usuario
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
          // Restablecemos las variables y volvemos a cargar los usuarios
          this.showEditForm = false;
          this.selectedUser = null;
          this.originalUser = null;
          this.formModified = false;
          this.loadUsers();
        },
        error: (error: any) => {
          console.error('Error al actualizar el usuario:', error);
        },
      });
    }
  }

  // Cancela la edición y restaura los valores originales
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
