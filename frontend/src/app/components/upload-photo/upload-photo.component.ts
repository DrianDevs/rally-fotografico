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
    this.configService.obtenerConfig().subscribe({
      next: (config) => {
        this.config = config;
      },
      error: (error) => {
        console.error('Error fetching config:', error);
      }
    });


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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onSubmit() {
    if (!this.validarPeriodoSubida()) {
      return;
    }

    if (!this.validarLimiteFotos()) {
      return;
    }

    if (!this.validarFormulario()) {
      return;
    }

    this.subirFoto();
  }

  private validarPeriodoSubida(): boolean {
    if (!this.verificarFechaSubida()) {
      this.mostrarMensajeError('❌ No puedes subir fotos en este momento. El periodo de subida no está activo.');
      return false;
    }
    return true;
  }

  private validarLimiteFotos(): boolean {
    if (this.config.max_photos_per_user <= this.numPhotosSubidas) {
      this.mostrarMensajeError('❌ Has alcanzado el límite de fotos permitidas.');
      return false;
    }
    return true;
  }

  private validarFormulario(): boolean {
    if (this.photoForm.invalid || !this.selectedFile) {
      this.mostrarMensajeError('❌ Por favor, completa todos los campos y selecciona una foto.');
      return false;
    }
    return true;
  }

  private subirFoto(): void {
    const formData = new FormData();
    formData.append('title', this.photoForm.value.title);
    formData.append('description', this.photoForm.value.description);
    formData.append('image', this.selectedFile!);
    formData.append('user_id', this.user.id.toString());
    formData.append('servicio', 'uploadPhoto');

    this.photoService.uploadPhoto(formData).subscribe({
      next: () => {
        this.limpiarFormulario();
        this.mostrarMensajeExito('✅ La foto se ha subido correctamente');
        this.router.navigate(['/participante']);
      },
      error: (err) => {
        this.mostrarMensajeError('❌ Error al subir la foto');
        console.error('Error al subir la foto', err);
      },
    });
  }

  private limpiarFormulario(): void {
    this.photoForm.reset();
    this.selectedFile = null;
  }

  private mostrarMensajeError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  private mostrarMensajeExito(mensaje: string): void {
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
