import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-image-viewer',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" (click)="close()">
      <div class="relative max-w-4xl max-h-[90vh] mx-auto" (click)="$event.stopPropagation()">
        <button class="absolute top-4 right-4 text-white hover:text-gray-300 z-10" (click)="close()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img [src]="imageUrl" [alt]="imageAlt" class="max-w-full max-h-[90vh] object-contain rounded-lg" />
      </div>
    </div>
  `,
    styles: []
})
export class ImageViewerComponent {
    @Input() isOpen = false;
    @Input() imageUrl = '';
    @Input() imageAlt = '';
    @Output() closeViewer = new EventEmitter<void>();

    close() {
        this.closeViewer.emit();
    }
} 