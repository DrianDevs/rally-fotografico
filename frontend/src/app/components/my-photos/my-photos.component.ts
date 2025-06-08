import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService } from '../../services/config.service';
import { PhotoService } from '../../services/photo.service';
import { NgClass } from '@angular/common';
import { ImageViewerComponent } from '../image-viewer/image-viewer.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-my-photos',
  imports: [NgClass, ImageViewerComponent],
  templateUrl: './my-photos.component.html',
  styleUrl: './my-photos.component.css'
})
export class MyPhotosComponent implements OnInit, OnChanges {
  @Input() user: any; // Recibimos el usuario desde el componente Zona User
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

  // Abre el visor de imágenes con la imagen seleccionada
  openImageViewer(imageUrl: string, imageAlt: string) {
    this.selectedImage = { url: imageUrl, alt: imageAlt };
  }

  // Cierra el visor de imágenes
  closeImageViewer() {
    this.selectedImage = null;
  }

  // Lleva al componente de Upload Photos si las validaciones son correctas
  goToUploadPhoto() {
    // Verifica si el periodo de subida de photos está activo
    if (!this.validateUploadPeriod()) {
      return;
    }

    // Si el usuario ha alcanzado el límite de photos subidas, no permite subir más
    if (!this.checkMaxPhotos()) {
      return;
    }

    this.router.navigate(['/subir-foto']);
  }

  private validateUploadPeriod(): boolean {
    if (!this.isInAllowedPeriod()) {
      this.showErrorMessage('❌ No puedes subir fotos en este momento. El periodo de subida no está activo.');
      return false;
    }
    return true;
  }

  private checkMaxPhotos(): boolean {
    if (this.config.max_photos_per_user <= this.photos.length) {
      this.showErrorMessage('❌ No puedes subir más fotos. Elimina alguna foto para poder subir una nueva.');
      return false;
    }
    return true;
  }

  // Función auxiliar para mostrar mensajes de error con snackBar
  private showErrorMessage(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  // Verifica si la fecha de hoy está dentro del periodo permitido
  isInAllowedPeriod() {
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
