import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PhotoService } from '../../services/photo.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-upload-photo',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './upload-photo.component.html',
  styleUrl: './upload-photo.component.css'
})
export class UploadPhotoComponent implements OnInit {
  public selectedFile: File | null = null;
  public user = {
    id: 0,
    name: '',
  };
  public photoForm!: FormGroup;
  public config: any;
  public numPhotosSubidas: number = 0;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private configService: ConfigService,
    private photoService: PhotoService,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Obtiene la configuración del backend
    this.configService.obtenerConfig().subscribe({
      next: (config) => {
        this.config = config;
      },
      error: (error) => {
        console.error('Error fetching config:', error);
      }
    });

    // Obtiene el usuario que quiere subir la foto
    const userId = this.authService.getUserInfo()?.sub;
    if (userId) {
      this.userService.obtenerUser(userId).subscribe({
        next: (userData) => {
          this.user = {
            id: userData.id,
            name: userData.name,
          };
        },
        error: (error) => {
          console.error('Error fetching user data:', error);
        }
      });
    }

    // Obtiene las fotos subidas por el usuario
    this.photoService.getPhotosById(userId).subscribe({
      next: (photos) => {
        this.numPhotosSubidas = photos.length;
      },
      error: (error) => {
        console.error('Error fetching photos:', error);
      }
    });


    this.photoForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
    });
    this.selectedFile = null;
  }

  // Coge el archivo seleccionado por del input
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }
  // Si pasa todas las validaciones, sube la foto
  onSubmit() {
    if (!this.validateUploadPeriod()) {
      return;
    }

    if (!this.validatePhotoLimit()) {
      return;
    }

    if (!this.validateForm()) {
      return;
    }

    this.uploadPhoto();
  }
  // Obtiene toda la información de la photo, la pone en formato FormData y la envía al backend
  uploadPhoto(): void {
    const formData = new FormData();
    formData.append('title', this.photoForm.value.title);
    formData.append('description', this.photoForm.value.description);
    formData.append('image', this.selectedFile!);
    formData.append('user_id', this.user.id.toString());
    formData.append('servicio', 'uploadPhoto'); this.photoService.uploadPhoto(formData).subscribe({
      next: () => {
        this.resetForm();
        this.showMessage('La foto se ha subido correctamente', 'success');
        this.router.navigate(['/participante']);
      },
      error: (err) => {
        this.showMessage('Error al subir la foto', 'error');
        console.error('Error al subir la foto', err);
      },
    });
  }

  // Resetea el formulario y resetea el input de la foto
  resetForm(): void {
    this.photoForm.reset();
    this.selectedFile = null;
  }

  validateUploadPeriod(): boolean {
    if (!this.verifyUploadDate()) {
      this.showMessage('No puedes subir fotos en este momento. El periodo de subida no está activo.', 'error');
      return false;
    }
    return true;
  }

  validatePhotoLimit(): boolean {
    if (this.config.max_photos_per_user <= this.numPhotosSubidas) {
      this.showMessage('Has alcanzado el límite de fotos permitidas.', 'error');
      return false;
    }
    return true;
  }

  validateForm(): boolean {
    if (this.photoForm.invalid || !this.selectedFile) {
      this.showMessage('Por favor, completa todos los campos y selecciona una foto.', 'error');
      return false;
    }
    return true;
  }

  verifyUploadDate() {
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


  // Muestra mensajes con snackBar (error o success)
  showMessage(mensaje: string, tipo: 'error' | 'success'): void {
    const icono = tipo === 'error' ? '❌' : '✅';
    this.snackBar.open(`${icono} ${mensaje}`, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
