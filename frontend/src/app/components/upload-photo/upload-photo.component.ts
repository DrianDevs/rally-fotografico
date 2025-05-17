import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PhotoService } from '../../services/photo.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-upload-photo',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './upload-photo.component.html',
  styleUrl: './upload-photo.component.css'
})
export class UploadPhotoComponent implements OnInit {
  public selectedFile: File | null = null;
  public user = {
    id: '',
    name: '',
  };
  public photoForm!: FormGroup;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private photoService: PhotoService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
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
    if (this.photoForm.invalid || !this.selectedFile) return;

    const formData = new FormData();
    formData.append('title', this.photoForm.value.title);
    formData.append('description', this.photoForm.value.description);
    formData.append('image', this.selectedFile);
    formData.append('user_id', this.user.id);
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
}
