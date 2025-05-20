import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PhotoService } from '../../services/photo.service';
import { ImageViewerComponent } from '../image-viewer/image-viewer.component';

@Component({
  selector: 'app-photo-validation',
  standalone: true,
  imports: [CommonModule, DatePipe, ImageViewerComponent],
  templateUrl: './photo-validation.component.html',
  styleUrl: './photo-validation.component.css'
})
export class PhotoValidationComponent implements OnInit {
  pendingPhotos: any[] = [];
  selectedImage: { url: string; alt: string } | null = null;

  constructor(private photoService: PhotoService) { }

  ngOnInit() {
    this.loadPendingPhotos();
  }

  loadPendingPhotos() {
    this.photoService.getPendingPhotos().subscribe(
      (photos) => {
        this.pendingPhotos = photos;
      },
      (error) => {
        console.error('Error al cargar las fotos pendientes:', error);
      }
    );
  }

  getPhotoUrl(filePath: string): string {
    return this.photoService.getPhotoUrl(filePath);
  }

  acceptPhoto(photoId: number) {
    if (confirm('¿Quieres aceptar esta foto?')) {
      this.photoService.updatePhotoStatus(photoId, 'accepted').subscribe(
        (photos) => {
          this.pendingPhotos = photos;
        },
        (error) => {
          console.error('Error al aceptar la foto:', error);
        }
      );
    }
  }

  rejectPhoto(photoId: number) {
    if (confirm('¿Quieres rechazar esta foto?')) {
      this.photoService.updatePhotoStatus(photoId, 'rejected').subscribe(
        (photos) => {
          this.pendingPhotos = photos;
        },
        (error) => {
          console.error('Error al rechazar la foto:', error);
        }
      );
    }
  }

  openImageViewer(imageUrl: string, imageAlt: string) {
    this.selectedImage = { url: imageUrl, alt: imageAlt };
  }

  closeImageViewer() {
    this.selectedImage = null;
  }
}
