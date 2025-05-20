import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private url: string = environment.API_URL + '/src/photos.php';

  constructor(private http: HttpClient) { }

  uploadPhoto(formData: FormData) {
    return this.http.post(this.url, formData);
  }

  getPhotosById(userId: number) {
    const body = {
      servicio: 'getPhotosByUserId',
      userId: userId
    }

    return this.http.post<any>(this.url, body);
  }

  getPhotoUrl(filePath: string): string {
    return `http://localhost/Drian/rally-fotografico/backend/${filePath}`;
  }

}
