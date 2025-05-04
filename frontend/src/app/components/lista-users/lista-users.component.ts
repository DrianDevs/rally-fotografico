import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';

@Component({
  selector: 'app-lista-users',
  imports: [RouterLink],
  templateUrl: './lista-users.component.html',
  styleUrl: './lista-users.component.css',
})
export class ListaUsersComponent {
  public users: User[] = [];

  constructor(private peticion: UserService) {
    this.peticion.obtenerUsers().subscribe({
      next: (data) => {
        this.users = data;
        console.log('Lista de usuarios:', this.users);
      },
      error: (error) => {
        console.error('Error al cargar la configuración:', error);
      },
    });
  }

  eliminarUser(userId: number) {}

  modificarUser(userId: number) {}
}
