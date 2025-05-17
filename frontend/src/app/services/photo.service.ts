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
}
