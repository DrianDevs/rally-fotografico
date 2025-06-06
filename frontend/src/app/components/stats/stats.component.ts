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

  loadTopPhotos() {
    this.photoService.getAcceptedPhotos().subscribe({
      next: (photos) => {
        // Tomamos sólo las 3 fotos con más votos
        this.topPhotos = photos
          .sort((a: any, b: any) => (b.votes_count || 0) - (a.votes_count || 0))
          .slice(0, 3);
        console.log('Top photos loaded:', this.topPhotos);
      },
      error: (error) => {
        console.error('Error loading top photos:', error);
      }
    });
  }
  loadTopUsers() {
    this.userService.obtenerUsuariosMasVotados().subscribe({
      next: (users) => {
        this.topUsers = users;
        console.log('Top users loaded:', this.topUsers);
      },
      error: (error) => {
        console.error('Error loading top users:', error);
      }
    });
  }

  loadTopPhotosToday() {
    this.photoService.getTopPhotosToday().subscribe({
      next: (photos) => {
        this.topPhotosToday = photos;
        console.log('Top photos today loaded:', this.topPhotosToday);
      },
      error: (error) => {
        console.error('Error loading top photos today:', error);
      }
    });
  }

  getPhotoUrl(filePath: string): string {
    return this.photoService.getPhotoUrl(filePath);
  }

  getBarWidth(votes: number): number {
    if (this.topUsers.length === 0) return 0;
    const maxVotes = Math.max(...this.topUsers.map(user => user.total_votes));
    return maxVotes > 0 ? (votes / maxVotes) * 100 : 0;
  }

  openImageViewer(imageUrl: string, imageAlt: string): void {
    this.selectedImage = { url: imageUrl, alt: imageAlt };
  }

  closeImageViewer(): void {
    this.selectedImage = null;
  }
}
