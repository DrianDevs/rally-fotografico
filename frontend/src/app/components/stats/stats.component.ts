import { Component, OnInit } from '@angular/core';
import { PhotoService } from '../../services/photo.service';
import { UserService } from '../../services/user.service';
import { ImageViewerComponent } from '../image-viewer/image-viewer.component';

@Component({
  selector: 'app-stats',
  imports: [ImageViewerComponent],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.css'
})
export class StatsComponent implements OnInit {
  public topPhotos: any[] = [];
  public topUsers: any[] = [];
  public topPhotosToday: any[] = [];
  public selectedImage: { url: string; alt: string } | null = null;

  constructor(private photoService: PhotoService, private userService: UserService) { }

  ngOnInit(): void {
    this.loadTopPhotos();
    this.loadTopUsers();
    this.loadTopPhotosToday();
  }

  // Obtiene las 3 fotos con más votos para el podio
  loadTopPhotos() {
    this.photoService.getAcceptedPhotos().subscribe({
      next: (photos) => {
        // Ordena las fotos por votos y toma las 3 con más votos
        this.topPhotos = photos
          .sort((a: any, b: any) => (b.votes_count || 0) - (a.votes_count || 0))
          .slice(0, 3);
      },
      error: (error) => {
        console.error('Error loading top photos:', error);
      }
    });
  }

  // Obtiene los usuarios con más votos entre todas sus fotos
  loadTopUsers() {
    this.userService.obtenerUsuariosMasVotados().subscribe({
      next: (users) => {
        this.topUsers = users;
      },
      error: (error) => {
        console.error('Error loading top users:', error);
      }
    });
  }

  // Obtiene las fotos más votadas subidas día de hoy
  loadTopPhotosToday() {
    this.photoService.getTopPhotosToday().subscribe({
      next: (photos) => {
        this.topPhotosToday = photos;
      },
      error: (error) => {
        console.error('Error loading top photos today:', error);
      }
    });
  }

  getPhotoUrl(filePath: string): string {
    return this.photoService.getPhotoUrl(filePath);
  }

  // Calcula el ancho de la barra de progreso para el gráfico de usuarios más votados  
  getBarWidth(votes: number): number {
    // Si no hay usuarios, devolvemos 0 para evitar una división entre cero
    if (this.topUsers.length === 0) return 0;

    // Porcentaje de ancho de la barra (0-100) basado en los votos máximos
    const maxVotes = Math.max(...this.topUsers.map(user => user.total_votes));
    return maxVotes > 0 ? (votes / maxVotes) * 100 : 0;
  }

  // Abre el visor de imágenes con la imagen seleccionada
  openImageViewer(imageUrl: string, imageAlt: string): void {
    this.selectedImage = { url: imageUrl, alt: imageAlt };
  }

  // Cierra el visor de imágenes
  closeImageViewer(): void {
    this.selectedImage = null;
  }
}
