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
    if (!this.verificarFechaSubida()) {
      this.snackBar.open('❌ No puedes subir fotos en este momento. El periodo de subida no está activo.', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }

    console.log('Número de fotos subidas:', this.numPhotosSubidas);
    console.log('Límite de fotos por usuario:', this.config.max_photos_per_user);
    if (this.config.max_photos_per_user <= this.numPhotosSubidas) {
      this.snackBar.open('❌ Has alcanzado el límite de fotos permitidas.', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }


    if (this.photoForm.invalid || !this.selectedFile) return;

    const formData = new FormData();
    formData.append('title', this.photoForm.value.title);
    formData.append('description', this.photoForm.value.description);
    formData.append('image', this.selectedFile);
    formData.append('user_id', this.user.id.toString());
    formData.append('servicio', 'uploadPhoto');


    this.photoService.uploadPhoto(formData).subscribe({
      next: (res) => {
        this.photoForm.reset();
        this.selectedFile = null;

        this.snackBar.open('✅ La foto se ha subido correctamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });

        this.router.navigate(['/participante']);
      },
      error: (err) => {
        this.snackBar.open('❌ Error al subir la foto', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        console.error('Error al subir la foto', err);
      },
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
