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
    if (this.validarCampos()) this.actualizarConfig();
  }

  validarCampos() {
    // Validación inicial del form
    if (!this.configForm.valid) return false;

    // Obtiene los valores del form
    const { recepcionInicio, recepcionFin, votacionInicio, votacionFin } =
      this.configForm.value;

    // Comprueba que los pares de fechas sean válidos
    return (
      this.validarPeriodoFechas(recepcionInicio, recepcionFin, 'recepción') &&
      this.validarPeriodoFechas(votacionInicio, votacionFin, 'votación')
    );
  }

  // ----------------- PETICIONES SERVICIO CONFIG -----------------

  cargarConfig() {
    this.configService.obtenerConfig().subscribe({
      next: (data) => {
        this.configForm.patchValue({
          recepcionInicio: this.formatearFecha(data.upload_start_date),
          recepcionFin: this.formatearFecha(data.upload_end_date),
          votacionInicio: this.formatearFecha(data.voting_start_date),
          votacionFin: this.formatearFecha(data.voting_end_date),
          limiteFotos: data.max_photos_per_user,
        });
      },
      error: (error) => {
        console.error('Error al cargar la configuración:', error);
      },
    });
  }

  actualizarConfig() {
    this.configService.actualizarConfig(this.configForm.value).subscribe({
      next: (data) => {
        alert('Configuración actualizada exitosamente');
      },
      error: (error) => {
        console.error('Error al actualizar la configuración:', error);
        alert('Error al actualizar la configuración');
      },
    });
  }

  // ----------------- FUNCIONES AUXILIARES -----------------

  // Función para formatear la fecha que devuelve el backend a yyyy-MM-dd (formato del formulario)
  formatearFecha = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Función para validar un período de fechas
  validarPeriodoFechas(
    fechaDesde: string,
    fechaHasta: string,
    nombrePeriodo: string
  ) {
    const fechaInicio = new Date(fechaDesde);
    const fechaFin = new Date(fechaHasta);

    // Calcular diferencia de días
    const diffTime = fechaFin.getTime() - fechaInicio.getTime();
    const dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (fechaInicio >= fechaFin) {
      alert(
        `La fecha de inicio de ${nombrePeriodo} debe ser anterior a la fecha de fin`
      );
      return false;
    }

    if (dias === 0) {
      alert(`El período de ${nombrePeriodo} debe ser de al menos un día`);
      return false;
    }

    return true;
  }
}
