import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private url: string = environment.API_URL + '/src/rally_config.php';

  constructor(private http: HttpClient) {}

  obtenerConfig() {
    let body = JSON.stringify({
      servicio: 'getConfig',
    });
    return this.http.post<any>(this.url, body);
  }

  actualizarConfig(config: any) {
    let body = JSON.stringify({
      servicio: 'updateConfig',
      ...config,
    });
    return this.http.post<any>(this.url, body);
  }
}
