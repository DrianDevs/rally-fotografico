import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-zona-user',
  imports: [RouterLink],
  templateUrl: './zona-user.component.html',
  styleUrl: './zona-user.component.css',
})
export class ZonaUserComponent implements OnInit {
  public user = {
    id: '',
    name: '',
    email: '',
  };
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const userInfo = this.authService.getUserInfo();
    if (userInfo) {
      this.user.name = userInfo.name;
      this.user.email = userInfo.email;
    }
  }
}
