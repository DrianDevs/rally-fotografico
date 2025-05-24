import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PhotoService } from '../../services/photo.service';
import { ImageViewerComponent } from '../image-viewer/image-viewer.component';

@Component({
  selector: 'app-main',
  imports: [RouterModule, ImageViewerComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent implements OnInit {
  public acceptedPhotos: any[] = [];
  public selectedImage: { url: string; alt: string } | null = null;

  constructor(private photoService: PhotoService) { }

  ngOnInit(): void {
    this.loadAcceptedPhotos();
  }

  loadAcceptedPhotos() {
    this.photoService.getAcceptedPhotos().subscribe({
      next: (photos) => {
        this.acceptedPhotos = photos;
      },
      error: (error) => {
        console.error('Error loading accepted photos:', error);
      }
    });
  }

  getPhotoUrl(filePath: string): string {
    return this.photoService.getPhotoUrl(filePath);
  }

  likePhoto(photoId: number) {
    this.photoService.likePhoto(photoId).subscribe({
      next: () => {
        this.loadAcceptedPhotos();
      },
      error: (error) => {
        console.error('Error liking photo:', error);
      }
    });
  }

  openImageViewer(imageUrl: string, imageAlt: string) {
    this.selectedImage = { url: imageUrl, alt: imageAlt };
  }

  closeImageViewer() {
    this.selectedImage = null;
  }
}
