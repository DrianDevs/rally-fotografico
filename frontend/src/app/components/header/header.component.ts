import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent {
    constructor(public authService: AuthService, private router: Router) { }

    logout() {
        this.authService.logout();
    }

    irAGaleria() {
        // Ir a main y hacer scroll a la sección de galería
        this.router.navigate(['/']).then(() => {
            setTimeout(() => {
                const gallerySection = document.querySelector('.gallery-section');
                if (gallerySection) {
                    gallerySection.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        });
    }
} 