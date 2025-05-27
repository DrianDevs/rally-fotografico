import { Component, OnInit } from '@angular/core';
import { PhotoService } from '../../services/photo.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-stats',
  imports: [],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.css'
})
export class StatsComponent implements OnInit {
  public topPhotos: any[] = [];
  public topUsers: any[] = [];

  constructor(private photoService: PhotoService, private userService: UserService) { }

  ngOnInit(): void {
    this.loadTopPhotos();
    this.loadTopUsers();
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

  getPhotoUrl(filePath: string): string {
    return this.photoService.getPhotoUrl(filePath);
  }

  getBarWidth(votes: number): number {
    if (this.topUsers.length === 0) return 0;
    const maxVotes = Math.max(...this.topUsers.map(user => user.total_votes));
    return maxVotes > 0 ? (votes / maxVotes) * 100 : 0;
  }
}
