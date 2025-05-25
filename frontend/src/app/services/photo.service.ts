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

  getPendingPhotos() {
    const body = {
      servicio: 'getPendingPhotos'
    }
    return this.http.post<any>(this.url, body);
  }

  updatePhotoStatus(photoId: number, status: 'accepted' | 'rejected') {
    const body = {
      servicio: 'updateStatus',
      id: photoId,
      status: status
    }
    return this.http.post<any>(this.url, body);
  }

  deletePhoto(photoId: number) {
    const body = {
      servicio: 'deletePhoto',
      id: photoId
    }
    return this.http.post<any>(this.url, body);
  }

  getAcceptedPhotos() {
    const body = {
      servicio: 'getAcceptedPhotos'
    }
    return this.http.post<any>(this.url, body);
  }

  likePhoto(photoId: number, userId: number) {
    const body = {
      servicio: 'likePhoto',
      photoId: photoId,
      userId: userId
    }
    return this.http.post<any>(this.url, body);
  }
}
