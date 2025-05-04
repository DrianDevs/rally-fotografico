import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private url: string = environment.API_URL + '/src/users.php';

  constructor(private http: HttpClient) {}

  obtenerUsers() {
    let body = JSON.stringify({
      servicio: 'getUsers',
    });
    return this.http.post<any>(this.url, body);
  }

  actualizarUser(user: User) {
    let body = JSON.stringify({
      servicio: 'updateUser',
      ...user,
    });
    return this.http.post<any>(this.url, body);
  }

  eliminarUser(userId: number) {
    let body = JSON.stringify({
      servicio: 'deleteUser',
      userId: userId,
    });
    return this.http.post<any>(this.url, body);
  }
}
