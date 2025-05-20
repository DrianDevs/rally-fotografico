import { Component } from '@angular/core';
import { RallyConfigComponent } from '../rally-config/rally-config.component';
import { RouterLink } from '@angular/router';
import { PhotoValidationComponent } from '../photo-validation/photo-validation.component';

@Component({
  selector: 'app-zona-admin',
  imports: [RallyConfigComponent, PhotoValidationComponent, RouterLink],
  templateUrl: './zona-admin.component.html',
  styleUrl: './zona-admin.component.css',
})
export class ZonaAdminComponent { }
