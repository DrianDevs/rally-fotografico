import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private url: string = environment.API_URL + '/src/users.php';

  constructor(private http: HttpClient) { }

  obtenerUsers() {
    let body = JSON.stringify({
      servicio: 'getUsers',
    });
    return this.http.post<any>(this.url, body);
  }

  obtenerUser(userId: number) {
    let body = JSON.stringify({
      servicio: 'getUser',
      id: userId,
    });
    return this.http.post<any>(this.url, body);
  }

  obtenerUsuariosMasVotados() {
    let body = JSON.stringify({
      servicio: 'getMostVotedUsers',
    });
    return this.http.post<any>(this.url, body);
  }

  insertarUser(data: any) {
    let body = JSON.stringify({
      servicio: 'insertarUser',
      ...data,
    });
    return this.http.post<any>(this.url, body);
  }

  actualizarUser(data: any) {
    let body = JSON.stringify({
      servicio: 'updateUser',
      ...data,
    });
    return this.http.post<any>(this.url, body);
  }

  actualizarPassword(id: any, password: any) {
    let body = JSON.stringify({
      servicio: 'updatePassword',
      password: password,
      id: id,
    });
    return this.http.post<any>(this.url, body);
  }

  eliminarUser(userId: number) {
    let body = JSON.stringify({
      servicio: 'deleteUser',
      id: userId,
    });
    return this.http.post<any>(this.url, body);
  }

  forgotPassword(email: string) {
    let body = JSON.stringify({
      servicio: 'forgotPassword',
      email: email,
    });
    return this.http.post<any>(this.url, body);
  }

  resetPassword(token: string, password: string) {
    let body = JSON.stringify({
      servicio: 'resetPassword',
      token: token,
      password: password,
    });
    return this.http.post<any>(this.url, body);
  }
}
