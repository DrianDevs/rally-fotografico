import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfigService } from '../../services/config.service';
import { PhotoService } from '../../services/photo.service';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-my-photos',
  imports: [RouterLink, NgClass],
  templateUrl: './my-photos.component.html',
  styleUrl: './my-photos.component.css'
})
export class MyPhotosComponent implements OnInit, OnChanges {
  @Input() user: any;
  public config: any;
  public photos: any[] = [];
  public cantidadPhotos: number[] = [];
  public fotosRestantes: number[] = [];

  constructor(private configService: ConfigService, private photoService: PhotoService) { }

  ngOnInit(): void {
    this.loadConfig();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['user'] && changes['user'].currentValue) {
      this.loadConfig();
    }
  }

  private loadConfig() {
    this.configService.obtenerConfig().subscribe((config) => {
      this.config = config;
      this.cantidadPhotos = Array.from({ length: this.config.max_photos_per_user });

      // Solo cargar las fotos si tenemos un usuario
      if (this.user) {
        this.getPhotos();
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
}
