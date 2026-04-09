import {
  Component, OnInit, OnDestroy, signal, computed, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { Report, ReportStatus, REPORT_CATEGORIES } from '../../models/report.models';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-reports-table',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    TableModule, ButtonModule, SelectModule, TagModule,
    ToastModule, ConfirmDialogModule, InputTextModule, DialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './reports-table.component.html',
  styleUrl: './reports-table.component.css'
})
export class ReportsTableComponent implements OnInit, OnDestroy {
  private reportService = inject(ReportService);
  private messageService = inject(MessageService);
  private confirmService = inject(ConfirmationService);
  private router = inject(Router);

  reports = computed(() => this.reportService.getAllReports());
  globalFilter = signal('');
  selectedSection = signal<string>('');
  isExporting = signal(false);
  private pollInterval: any;

  // ── Edit Dialog ────────────────────────────────
  showEditDialog = signal(false);
  editingReport = signal<Report | null>(null);
  editStatus = signal<ReportStatus>('pendiente');
  editComentarios = signal('');

  statusPickerOptions = [
    { value: 'pendiente',   label: 'Pendiente',   icon: 'pi-clock',        color: '#f59e0b' },
    { value: 'finalizado',  label: 'Finalizado',  icon: 'pi-check-circle', color: '#10b981' },
  ] as const;
  // ──────────────────────────────────────────────

  sections = ['A','B','C','D','E','F','G','H','I','J','K'];

  stats = computed(() => {
    const all = this.reports();
    return {
      total: all.length,
      pendiente: all.filter(r => r.status === 'pendiente').length,
      finalizado: all.filter(r => r.status === 'finalizado').length,
    };
  });

  filteredReports = computed(() => {
    const section = this.selectedSection();
    const filter = this.globalFilter().toLowerCase();
    let data = this.reports();
    if (section) data = data.filter(r => r.seccion === section);
    if (filter) {
      data = data.filter(r =>
        r.estacion.toLowerCase().includes(filter) ||
        r.categoriaLabel.toLowerCase().includes(filter) ||
        r.subcategoria.toLowerCase().includes(filter) ||
        r.comentarios?.toLowerCase().includes(filter)
      );
    }
    return data;
  });

  ngOnInit(): void {
    // Poll every 3 seconds for new reports
    this.pollInterval = setInterval(() => {
      this.reportService.refreshReports();
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  // ── Edit dialog ───────────────────────────────
  openEdit(report: Report): void {
    this.editingReport.set(report);
    this.editStatus.set(report.status);
    this.editComentarios.set(report.comentarios ?? '');
    this.showEditDialog.set(true);
  }

  closeEdit(): void {
    this.showEditDialog.set(false);
    this.editingReport.set(null);
  }

  saveEdit(): void {
    const report = this.editingReport();
    if (!report) return;
    this.reportService.updateReport(report.id, {
      status: this.editStatus(),
      comentarios: this.editComentarios(),
    });
    this.messageService.add({
      severity: 'success',
      summary: 'Reporte actualizado',
      detail: `${report.estacion} — ${this.getStatusLabel(this.editStatus())}`,
      life: 2500
    });
    this.closeEdit();
  }
  // ─────────────────────────────────────────────

  getStatusSeverity(status: ReportStatus): 'warn' | 'info' | 'success' | 'secondary' {
    const map: Record<ReportStatus, 'warn' | 'info' | 'success'> = {
      pendiente: 'warn',
      en_progreso: 'info',
      finalizado: 'success',
    };
    return map[status];
  }

  getStatusLabel(status: ReportStatus): string {
    return this.reportService.getStatusLabel(status);
  }

  getCategoryColor(cat: string): string {
    return REPORT_CATEGORIES.find(c => c.id === cat)?.color ?? '#94a3b8';
  }

  confirmDelete(report: Report): void {
    this.confirmService.confirm({
      message: `¿Eliminar el reporte de ${report.estacion}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-trash',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.reportService.deleteReport(report.id);
        this.messageService.add({
          severity: 'info',
          summary: 'Eliminado',
          detail: 'El reporte fue eliminado.',
          life: 2000
        });
      }
    });
  }

  async exportExcel(): Promise<void> {
    this.isExporting.set(true);
    try {
      await this.reportService.exportToExcel(this.filteredReports());
      this.messageService.add({
        severity: 'success',
        summary: 'Excel generado',
        detail: `Se exportaron ${this.filteredReports().length} reportes`,
        life: 3000
      });
    } catch (e) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error al exportar',
        detail: 'No se pudo generar el archivo Excel.',
        life: 3000
      });
    } finally {
      this.isExporting.set(false);
    }
  }

  goToQR(): void {
    this.router.navigate(['/qr']);
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
