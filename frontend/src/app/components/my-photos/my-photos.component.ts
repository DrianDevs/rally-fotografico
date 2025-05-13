import { Component, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-photos',
  imports: [RouterLink],
  templateUrl: './my-photos.component.html',
  styleUrl: './my-photos.component.css'
})
export class MyPhotosComponent implements OnInit {
  @Input() user: any;

  constructor() { }

  ngOnInit(): void {
    console.log('User data in MyPhotosComponent:', this.user);
  }
}
