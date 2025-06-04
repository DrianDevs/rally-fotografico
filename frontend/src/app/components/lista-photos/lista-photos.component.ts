import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PhotoService } from '../../services/photo.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-lista-photos',
    imports: [RouterLink, FormsModule],
    templateUrl: './lista-photos.component.html',
    styleUrl: './lista-photos.component.css',
})
export class ListaPhotosComponent implements OnInit {
    public photos: any[] = [];
    public showEditForm: boolean = false;
    public selectedPhoto: any = null;
    public formModified: boolean = false;
    private originalPhoto: any = null;
    public selectedFile: File | null = null;

    constructor(private photoService: PhotoService) { }

    ngOnInit(): void {
        this.loadPhotos();
    }

    loadPhotos() {
        this.photoService.getPhotos().subscribe({
            next: (data) => {
                console.log(data);
                this.photos = data;
            },
            error: (error) => {
                console.error('Error al cargar las fotos:', error);
            },
        });
    }

    eliminarPhoto(photoId: number) {
        if (!confirm('¿Está seguro que desea eliminar esta foto?')) return;

        this.photoService.deletePhoto(photoId).subscribe({
            next: (response) => {
                this.loadPhotos();
            },
            error: (error) => {
                console.error('Error al eliminar la foto:', error);
            },
        });
    }

    modificarPhoto(photoId: number) {
        const photoToEdit = this.photos.find((photo) => photo.id === photoId);
        if (photoToEdit) {
            this.originalPhoto = { ...photoToEdit };
            this.selectedPhoto = { ...photoToEdit };
            this.showEditForm = true;
            this.formModified = false;
            this.selectedFile = null;
        }
    }

    onFormChange() {
        this.formModified = true;
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            this.formModified = true;
        }
    }

    guardarCambios() {
        if (!this.selectedPhoto) {
            alert('No hay foto seleccionada para modificar.');
            return;
        }

        if (this.selectedFile) {
            // Si hay un nuevo archivo, primero lo subimos
            const formData = new FormData();
            formData.append('image', this.selectedFile);
            formData.append('title', this.selectedPhoto.title);
            formData.append('description', this.selectedPhoto.description);
            formData.append('user_id', this.selectedPhoto.user_id.toString());
            formData.append('servicio', 'updatePhoto');
            formData.append('photo_id', this.selectedPhoto.id.toString());

            this.photoService.uploadPhoto(formData).subscribe({
                next: (response: any) => {
                    this.showEditForm = false;
                    this.selectedPhoto = null;
                    this.originalPhoto = null;
                    this.formModified = false;
                    this.selectedFile = null;
                    this.loadPhotos();
                },
                error: (error: any) => {
                    console.error('Error al actualizar la foto:', error);
                },
            });
        } else {
            // Si no hay nuevo archivo, solo actualizamos los datos
            const photoData = {
                id: this.selectedPhoto.id,
                title: this.selectedPhoto.title,
                description: this.selectedPhoto.description,
                file_path: this.selectedPhoto.file_path
            };

            this.photoService.updatePhoto(photoData).subscribe({
                next: (response: any) => {
                    this.showEditForm = false;
                    this.selectedPhoto = null;
                    this.originalPhoto = null;
                    this.formModified = false;
                    this.loadPhotos();
                },
                error: (error: any) => {
                    console.error('Error al actualizar la foto:', error);
                },
            });
        }
    }

    cancelarEdicion() {
        if (this.originalPhoto && this.selectedPhoto) {
            const index = this.photos.findIndex(
                (photo) => photo.id === this.originalPhoto!.id
            );
            if (index !== -1) {
                this.photos[index] = { ...this.originalPhoto };
            }
        }
        this.showEditForm = false;
        this.selectedPhoto = null;
        this.originalPhoto = null;
        this.formModified = false;
        this.selectedFile = null;
    }

    getPhotoUrl(filePath: string): string {
        return this.photoService.getPhotoUrl(filePath);
    }
} 