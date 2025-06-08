import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ConfigService } from '../../services/config.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-rally-config',
  imports: [ReactiveFormsModule],
  templateUrl: './rally-config.component.html',
  styleUrl: './rally-config.component.css',
})
export class RallyConfigComponent implements OnInit {
  public configForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private configService: ConfigService,
    private snackBar: MatSnackBar
  ) {
    this.configForm = this.fb.group({
      recepcionInicio: ['', Validators.required],
      recepcionFin: ['', Validators.required],
      votacionInicio: ['', Validators.required],
      votacionFin: ['', Validators.required],
      limiteFotos: ['', [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit() {
    this.loadConfig();
  }

  onSubmit() {
    if (this.validateForm()) this.updateConfig();
  }

  // Obtiene la configuración actual del backend
  loadConfig() {
    this.configService.obtenerConfig().subscribe({
      next: (data) => {
        this.configForm.patchValue({
          recepcionInicio: this.formatDate(data.upload_start_date),
          recepcionFin: this.formatDate(data.upload_end_date),
          votacionInicio: this.formatDate(data.voting_start_date),
          votacionFin: this.formatDate(data.voting_end_date),
          limiteFotos: data.max_photos_per_user,
        });
      },
      error: (error) => {
        this.showMessage('❌ Error al cargar la configuración', 'error');
      },
    });
  }

  // Actualiza la configuración en el backend
  updateConfig() {
    this.configService.actualizarConfig(this.configForm.value).subscribe({
      next: (data) => {
        this.showMessage('✅ Configuración actualizada exitosamente', 'success');
      },
      error: (error) => {
        console.error('Error al actualizar la configuración:', error);
        this.showMessage('❌ Error al actualizar la configuración', 'error');
      },
    });
  }

  validateForm() {
    // Validación inicial del form
    if (!this.configForm.valid) return false;

    // Obtiene los valores del form
    const { recepcionInicio, recepcionFin, votacionInicio, votacionFin } =
      this.configForm.value;

    // Comprueba que los pares de fechas sean válidos
    return (
      this.validateDatePeriod(recepcionInicio, recepcionFin, 'recepción') &&
      this.validateDatePeriod(votacionInicio, votacionFin, 'votación')
    );
  }

  // Función para validar un período de fechas
  validateDatePeriod(
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
      this.showMessage(`❌ La fecha de inicio de ${nombrePeriodo} debe ser anterior a la fecha de fin`, 'error');
      return false;
    }

    if (dias === 0) {
      this.showMessage(`❌ El período de ${nombrePeriodo} debe ser de al menos un día`, 'error');
      return false;
    }

    return true;
  }

  // Formatea la fecha que devuelve el backend a yyyy-MM-dd (formato del formulario)
  formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Muestra mensajes con snackBar (error o success)
  showMessage(mensaje: string, tipo: 'error' | 'success'): void {
    const icono = tipo === 'error' ? '❌' : '✅';
    this.snackBar.open(`${icono} ${mensaje}`, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
