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
    // Log para verificar el contenido del FormData
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }
    return this.http.post(this.url, formData);
  }
}
