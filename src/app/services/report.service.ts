import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { saveAs } from 'file-saver';
import { Report, ReportStatus, ReportCategory, REPORT_CATEGORIES, ALL_CATEGORIES, ReportSubcategory } from '../models/report.models';

const API_URL = 'http://172.19.36.143:3000/api/reports';
const OTROS_API_URL = 'http://172.19.36.143:3000/api/otros-categories';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private http = inject(HttpClient);
  
  private _reports = signal<Report[]>([]);
  reports = computed(() => this._reports());

  constructor() {
    this.refreshReports();
  }

  // ── OTROS Custom Categories ──
  async getOtrosCategories(): Promise<ReportSubcategory[]> {
    try {
      return await firstValueFrom(this.http.get<ReportSubcategory[]>(OTROS_API_URL));
    } catch {
      return [];
    }
  }

  async addOtrosCategory(label: string, categoryId?: string): Promise<ReportSubcategory | null> {
    try {
      return await firstValueFrom(this.http.post<ReportSubcategory>(OTROS_API_URL, { label, categoryId }));
    } catch {
      return null;
    }
  }

  async updateOtrosCategory(id: string, label: string): Promise<void> {
    try {
      await firstValueFrom(this.http.put<ReportSubcategory>(`${OTROS_API_URL}/${id}`, { label }));
    } catch { }
  }

  async deleteOtrosCategory(id: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`${OTROS_API_URL}/${id}`));
    } catch { }
  }
  // ─────────────────────────────

  async refreshReports(): Promise<void> {
    try {
      const data = await firstValueFrom(this.http.get<Report[]>(API_URL));
      this._reports.set(data);
    } catch (e) {
      console.error('Error loading reports. Make sure backend is running.', e);
    }
  }

  // ── CRUD ──────────────────────────────────────────
  async addReport(data: Omit<Report, 'id' | 'creadoEn' | 'actualizadoEn'>): Promise<Report | null> {
    const now = new Date().toISOString();
    try {
      const newReport = await firstValueFrom(this.http.post<Report>(API_URL, {
        ...data,
        fecha: now
      }));
      // Update local signal immediately for responsive UI
      this._reports.update(curr => [newReport, ...curr]);
      return newReport;
    } catch (e) {
      console.error('Failed to add report', e);
      return null;
    }
  }

  async updateStatus(id: string, status: ReportStatus): Promise<void> {
    return this.updateReport(id, { status });
  }

  async updateReport(id: string, changes: Partial<Report>): Promise<void> {
    try {
      const updatedReport = await firstValueFrom(this.http.put<Report>(`${API_URL}/${id}`, changes));
      this._reports.update(curr => curr.map(r => r.id === id ? updatedReport : r));
    } catch (e) {
      console.error('Failed to update report', e);
    }
  }

  async deleteReport(id: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`${API_URL}/${id}`));
      this._reports.update(curr => curr.filter(r => r.id !== id));
    } catch (e) {
      console.error('Failed to delete report', e);
    }
  }

  getByStation(estacion: string): Report[] {
    return this._reports().filter(r => r.estacion === estacion.toUpperCase());
  }

  getAllReports(): Report[] {
    return this._reports();
  }

  // ── Categories helper ─────────────────────────────
  getCategoryColor(cat: ReportCategory): string {
    return ALL_CATEGORIES.find(c => c.id === cat)?.color ?? '#94a3b8';
  }

  getCategoryLabel(cat: ReportCategory): string {
    return ALL_CATEGORIES.find(c => c.id === cat)?.label ?? cat;
  }

  // ── Status helpers ────────────────────────────────
  getStatusLabel(status: ReportStatus): string {
    const labels: Record<ReportStatus, string> = {
      pendiente: 'Pendiente',
      en_progreso: 'En Progreso',
      finalizado: 'Finalizado',
    };
    return labels[status];
  }

  getStatusColor(status: ReportStatus): string {
    const colors: Record<ReportStatus, string> = {
      pendiente: '#f59e0b',
      en_progreso: '#3b82f6',
      finalizado: '#10b981',
    };
    return colors[status];
  }

  async exportToExcel(reports?: Report[]): Promise<void> {
    const XLSX = await import('xlsx');
    const data = (reports ?? this._reports()).map(r => ({
      'ID': r.id,
      'Fecha': new Date(r.fecha).toLocaleDateString('es-MX', { dateStyle: 'short' }),
      'Hora': new Date(r.creadoEn).toLocaleTimeString('es-MX', { timeStyle: 'short' }),
      'Estación': r.estacion,
      'Sección': r.seccion,
      'Categoría': r.categoriaLabel,
      'Problema': r.subcategoria,
      'Comentarios': r.comentarios || '',
      'Estado': this.getStatusLabel(r.status),
      'Fecha de atención': new Date(r.creadoEn).toLocaleString('es-MX')
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reportes');

    ws['!cols'] = [
      { wch: 10 }, { wch: 12 }, { wch: 8 }, { wch: 10 },
      { wch: 8 }, { wch: 15 }, { wch: 35 }, { wch: 40 },
      { wch: 12 }, { wch: 18 }
    ];

    const date = new Date().toISOString().split('T')[0];
    const fileName = `disbof-reportes-${date}.xlsx`;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      // Las descargas de Blob a veces fallan y descargan 0 bytes en Android 
      // debido a cómo el gestor del SO separa la descarga de la pestaña activa.
      // Usar la descarga nativa de XLSX previene esto en móviles.
      XLSX.writeFile(wb, fileName);
    } else {
      // En computadoras de escritorio, usamos FileSaver para evitar que 
      // sistemas de seguridad o el navegador lo renombren a un código UUID.
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      const blob: Blob = new Blob([excelBuffer], { type: EXCEL_TYPE });
      saveAs(blob, fileName);
    }
  }
}
