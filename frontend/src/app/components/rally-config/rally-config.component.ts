import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-rally-config',
  imports: [ReactiveFormsModule],
  templateUrl: './rally-config.component.html',
  styleUrl: './rally-config.component.css',
})
export class RallyConfigComponent implements OnInit {
  public configForm: FormGroup;

  constructor(private fb: FormBuilder, private configService: ConfigService) {
    this.configForm = this.fb.group({
      recepcionInicio: ['', Validators.required],
      recepcionFin: ['', Validators.required],
      votacionInicio: ['', Validators.required],
      votacionFin: ['', Validators.required],
      limiteFotos: ['', [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit() {
    this.cargarConfig();
  }

  onSubmit() {
    if (this.configForm.valid) {
      const { recepcionInicio, recepcionFin, votacionInicio, votacionFin } =
        this.configForm.value;
      if (
        this.validarPeriodoFechas(recepcionInicio, recepcionFin, 'recepción')
          .valido &&
        this.validarPeriodoFechas(votacionInicio, votacionFin, 'votación')
          .valido
      ) {
        this.actualizarConfig();
      }
    }
  }

  cargarConfig() {
    this.configService.obtenerConfig().subscribe({
      next: (data) => {
        console.log(data);
        console.log('Tipo de data:', typeof data);
        this.configForm.patchValue({
          recepcionInicio: this.formatDate(data.upload_start_date),
          recepcionFin: this.formatDate(data.upload_end_date),
          votacionInicio: this.formatDate(data.voting_start_date),
          votacionFin: this.formatDate(data.voting_end_date),
          limiteFotos: data.max_photos_per_user,
        });
      },
      error: (error) => {
        console.error('Error al cargar la configuración:', error);
      },
    });
  }

  actualizarConfig() {
    console.log(this.configForm.value);
  }

  // ----------------- FUNCIONES AUXILIARES -----------------

  // Función para formatear la fecha que devuelve el backend a yyyy-MM-dd (formato del formulario)
  formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Función para validar un período de fechas
  validarPeriodoFechas(
    fechaDesde: string,
    fechaHasta: string,
    nombrePeriodo: string
  ): { valido: boolean; dias: number } {
    const fechaInicio = new Date(fechaDesde);
    const fechaFin = new Date(fechaHasta);

    // Calcular diferencia de días
    const diffTime = fechaFin.getTime() - fechaInicio.getTime();
    const dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    console.log(`Días de ${nombrePeriodo}: ${dias}`);

    if (fechaInicio >= fechaFin) {
      alert(
        `La fecha de inicio de ${nombrePeriodo} debe ser anterior a la fecha de fin`
      );
      return { valido: false, dias };
    }

    if (dias === 0) {
      alert(`El período de ${nombrePeriodo} debe ser de al menos un día`);
      return { valido: false, dias };
    }

    return { valido: true, dias };
  }
}
