import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PhotoService } from '../../services/photo.service';
import { ImageViewerComponent } from '../image-viewer/image-viewer.component';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-main',
  imports: [RouterModule, ImageViewerComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent implements OnInit {
  public user: any = null;
  public acceptedPhotos: any[] = [];
  public allPhotos: any[] = []; // Store original photos array
  public selectedImage: { url: string; alt: string } | null = null;
  public sortBy: 'popular' | 'recent' = 'popular'; // Default to popular
  public config: any = null; // Configuración del rally

  constructor(
    private photoService: PhotoService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private configService: ConfigService
  ) { }
  ngOnInit(): void {
    this.loadConfig();
    this.loadAcceptedPhotos();
  }

  loadConfig() {
    this.configService.obtenerConfig().subscribe({
      next: (config) => {
        this.config = config;
        console.log('Configuración cargada:', this.config);
      },
      error: (error) => {
        console.error('Error al obtener la configuración:', error);
      }
    });
  }

  loadAcceptedPhotos() {
    this.photoService.getAcceptedPhotos().subscribe({
      next: (photos) => {
        this.allPhotos = photos; // Store original data
        this.sortPhotos(); // Apply current sorting
        console.log('Accepted photos loaded:', this.acceptedPhotos);
      },
      error: (error) => {
        console.error('Error loading accepted photos:', error);
      }
    });

    if (this.authService.isLoggedIn()) {
      this.user = this.authService.getUserInfo();
      console.log('User info:', this.user);
    }

  }

  setSortBy(sortType: 'popular' | 'recent') {
    this.sortBy = sortType;
    this.sortPhotos();
  }

  sortPhotos() {
    if (this.sortBy === 'popular') {
      this.acceptedPhotos = [...this.allPhotos].sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0));
    } else if (this.sortBy === 'recent') {
      this.acceptedPhotos = [...this.allPhotos].sort((a, b) => new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime());
    }
  }
  getPhotoUrl(filePath: string): string {
    return this.photoService.getPhotoUrl(filePath);
  }

  verificarFechaVotacion(): boolean {
    if (!this.config || !this.config.voting_start_date || !this.config.voting_end_date) {
      return false;
    }

    // Obtener la fecha de hoy en el formato YYYY-MM-DD 00:00:00
    const today = new Date();
    const todayStr = today.getFullYear() + '-' +
      String(today.getMonth() + 1).padStart(2, '0') + '-' +
      String(today.getDate()).padStart(2, '0') + ' 00:00:00';

    // Convertir fechas a objetos Date para poder compararlos
    const startDate = new Date(this.config.voting_start_date.replace(' ', 'T'));
    const endDate = new Date(this.config.voting_end_date.replace(' ', 'T'));
    const currentDate = new Date(todayStr.replace(' ', 'T'));

    // Comparar si la fecha de hoy está en el rango (inclusive)
    return currentDate >= startDate && currentDate <= endDate;
  }

  likePhoto(photoId: number) {
    if (!this.user) {
      this.snackBar.open('ℹ️ Necesitas iniciar sesión para poder votar las fotografías.', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    // Verificar si estamos en el período de votación
    if (!this.verificarFechaVotacion()) {
      this.snackBar.open('❌ Las votaciones no están activas en este momento. Consulta las fechas del período de votación.', 'Cerrar', {
        duration: 4000,
      });
      return;
    }

    console.log('Liking photo with ID:', photoId, this.user.sub);
    this.photoService.likePhoto(photoId, this.user.sub).subscribe({
      next: (respuesta) => {
        this.loadAcceptedPhotos(); // This will refresh and re-sort
        if (respuesta.action === 'unliked') {
          this.snackBar.open('💔 Has quitado tu voto de esta foto.', 'Cerrar', {
            duration: 3000,
          });
        } else {
          this.snackBar.open('♥️ Has votado esta foto.', 'Cerrar', {
            duration: 3000,
          });
        }
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
