import { Component } from '@angular/core';
import { RallyConfigComponent } from '../rally-config/rally-config.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-zona-admin',
  imports: [RallyConfigComponent, RouterLink],
  templateUrl: './zona-admin.component.html',
  styleUrl: './zona-admin.component.css',
})
export class ZonaAdminComponent {}
