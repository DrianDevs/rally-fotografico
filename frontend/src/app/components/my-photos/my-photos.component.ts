import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ConfigService } from '../../services/config.service';
import { PhotoService } from '../../services/photo.service';
import { NgClass } from '@angular/common';
import { ImageViewerComponent } from '../image-viewer/image-viewer.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-my-photos',
  imports: [RouterLink, NgClass, ImageViewerComponent],
  templateUrl: './my-photos.component.html',
  styleUrl: './my-photos.component.css'
})
export class MyPhotosComponent implements OnInit, OnChanges {
  @Input() user: any;
  public config: any;
  public photos: any[] = [];
  public cantidadPhotos: number[] = [];
  public fotosRestantes: number[] = [];
  public selectedImage: { url: string; alt: string } | null = null;

  constructor(private configService: ConfigService, private photoService: PhotoService, private router: Router, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.loadConfig();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['user'] && changes['user'].currentValue) {
      this.loadConfig();
    }
  }

  private loadConfig() {
    this.configService.obtenerConfig().subscribe({
      next: (config) => {
        this.config = config;
        this.cantidadPhotos = Array.from({ length: this.config.max_photos_per_user });

        // Solo cargar las fotos si hemos recibido un usuario
        if (this.user) {
          this.getPhotos();
        }
      },
      error: (error) => {
        console.error('Error al obtener la configuración:', error);
      }
    });
  }

  getPhotoUrl(filePath: string): string {
    return this.photoService.getPhotoUrl(filePath);
  }

  getPhotos() {
    // Si no tenemos la configuración, no se cargan las fotos
    if (!this.config) {
      return;
    }

    this.photoService.getPhotosById(this.user.id).subscribe((photos) => {
      this.photos = photos;
      const cantidadFotosRestantes = this.config.max_photos_per_user - this.photos.length;
      this.fotosRestantes = Array.from({ length: cantidadFotosRestantes });
    });
  }

  deletePhoto(photoId: number) {
    if (confirm('¿Estás seguro de que quieres eliminar esta foto?')) {
      this.photoService.deletePhoto(photoId).subscribe({
        next: () => {
          this.getPhotos();   // Actualizar la lista de fotos después de eliminar
        },
        error: (error) => {
          console.error('Error al eliminar la foto:', error);
          alert('Hubo un error al eliminar la foto');
        }
      });
    }
  }

  openImageViewer(imageUrl: string, imageAlt: string) {
    this.selectedImage = { url: imageUrl, alt: imageAlt };
  }

  closeImageViewer() {
    this.selectedImage = null;
  }

  goToUploadPhoto() {
    if (!this.validarPeriodoSubida()) {
      return;
    }

    if (!this.validarLimiteFotos()) {
      return;
    }

    // Si pasa las validaciones, navega a la página de subida de fotos
    this.router.navigate(['/subir-foto']);
  }

  private validarPeriodoSubida(): boolean {
    if (!this.verificarFechaSubida()) {
      this.mostrarMensajeError('❌ No puedes subir fotos en este momento. El periodo de subida no está activo.');
      return false;
    }
    return true;
  }

  private validarLimiteFotos(): boolean {
    if (this.config.max_photos_per_user <= this.photos.length) {
      this.mostrarMensajeError('❌ No puedes subir más fotos. Elimina alguna foto para poder subir una nueva.');
      return false;
    }
    return true;
  }

  private mostrarMensajeError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  verificarFechaSubida() {
    if (!this.config || !this.config.upload_start_date || !this.config.upload_end_date) {
      return false;
    }
    // Obtener la fecha de hoy en el formato YYYY-MM-DD 00:00:00
    const today = new Date();
    const todayStr = today.getFullYear() + '-' +
      String(today.getMonth() + 1).padStart(2, '0') + '-' +
      String(today.getDate()).padStart(2, '0') + ' 00:00:00';

    // Convertir fechas a objetos Date para poder compararlos
    const startDate = new Date(this.config.upload_start_date.replace(' ', 'T'));
    const endDate = new Date(this.config.upload_end_date.replace(' ', 'T'));
    const currentDate = new Date(todayStr.replace(' ', 'T'));

    // Comparar si la fecha de hoy está en el rango (inclusive)
    return currentDate >= startDate && currentDate <= endDate;
  }
}
