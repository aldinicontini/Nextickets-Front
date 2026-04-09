import {
  Component, OnInit, signal, computed, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { BadgeModule } from 'primeng/badge';
import { MessageService } from 'primeng/api';

import {
  REPORT_CATEGORIES, ReportCategoryDef, ReportSubcategory,
  isValidStation, getStation, Station
} from '../../models/report.models';
import { ReportService } from '../../services/report.service';

type FormStep = 'categories' | 'subcategories' | 'confirm_dialog' | 'success';

@Component({
  selector: 'app-report-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ButtonModule, DialogModule, TextareaModule, ToastModule, BadgeModule,
  ],
  providers: [MessageService],
  templateUrl: './report-form.component.html',
  styleUrl: './report-form.component.css'
})
export class ReportFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reportService = inject(ReportService);
  private messageService = inject(MessageService);

  // State
  station = signal<Station | null>(null);
  invalidStation = signal(false);
  estacionCode = signal('');

  categories = REPORT_CATEGORIES;
  selectedCategory = signal<ReportCategoryDef | null>(null);
  selectedSubcategory = signal<ReportSubcategory | null>(null);

  showConfirmDialog = signal(false);
  comentarios = signal('');
  isSubmitting = signal(false);
  showSuccess = signal(false);

  // El técnico elige el estado inicial al guardar
  selectedStatus = signal<'pendiente' | 'en_progreso' | 'finalizado'>('pendiente');

  statusOptions = [
    { value: 'pendiente',    label: 'Pendiente',    icon: 'pi-clock',         color: '#f59e0b' },
    { value: 'finalizado',   label: 'Finalizado',   icon: 'pi-check-circle',  color: '#10b981' },
  ] as const;

  // Custom Input Mode (For OTROS)
  customMode = signal(false);
  customText = signal('');

  // Buscador de subcategorías (OTROS)
  subSearch = signal('');
  filteredSubcategories = computed(() => {
    const subs = this.selectedCategory()?.subcategories ?? [];
    const term = this.subSearch().trim().toLowerCase();
    if (!term) return subs;
    // El botón "Añadir otro..." siempre aparece al final si hay búsqueda activa
    const others = subs.filter(s => s.id === 'otro_custom');
    const filtered = subs.filter(s => s.id !== 'otro_custom' && s.label.toLowerCase().includes(term));
    return [...filtered, ...others];
  });

  // Edit Category Dialog
  showEditDialog = signal(false);
  editText = signal('');
  private editingCategory: ReportSubcategory | null = null;

  // Count of reports per category for this station
  reportCounts = computed(() => {
    const station = this.station();
    if (!station) return {};
    const reports = this.reportService.getByStation(station.code);
    const counts: Record<string, number> = {};
    for (const cat of this.categories) {
      counts[cat.id] = reports.filter(r => r.categoria === cat.id && r.status !== 'finalizado').length;
    }
    return counts;
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const estacion = params['estacion'];
      if (!estacion) {
        this.invalidStation.set(true);
        return;
      }
      this.estacionCode.set(estacion.toUpperCase());
      if (!isValidStation(estacion)) {
        this.invalidStation.set(true);
        return;
      }
      this.station.set(getStation(estacion) ?? null);

      if (estacion.toUpperCase() === 'OTROS') {
        this.loadOtrosCategories();
      }
    });
  }

  async loadOtrosCategories(): Promise<void> {
    const customCats = await this.reportService.getOtrosCategories();
    this.selectedCategory.set({
      id: 'otros' as any,
      label: 'Otros Equipos',
      icon: 'pi pi-desktop',
      color: '#64748b',
      gradient: '',
      subcategories: [
        { id: 'impresora',           label: 'Impresora' },
        { id: 'compartida',          label: 'Carpeta Compartida' },
        { id: 'equipo_admin',        label: 'Equipo administrativo' },
        { id: 'bd_sinue',            label: 'Bases de datos sinue' },
        { id: 'usuario_checador',    label: 'Agregar usuarios al checador' },
        { id: 'reinicio_servidor',   label: 'Reinicio de Servidor' },
        { id: 'pantalla_comedor',    label: 'Pantalla comedor' },
        { id: 'pantalla_capac',      label: 'Pantalla capacitacion' },
        { id: 'prob_checador',       label: 'Problemas con checador' },
        { id: 'camaras_recepcion',   label: 'Camaras recepcion' },
        { id: 'cambio_proveedor',    label: 'Cambio de proovedor de red' },
        ...customCats,

        { id: 'otro_custom', label: 'Añadir otro...' }
      ]
    });
  }

  selectCategory(cat: ReportCategoryDef): void {
    this.selectedCategory.set(cat);
  }

  backToCategories(): void {
    if (this.customMode()) {
      this.customMode.set(false);
      return;
    }
    if (this.station()?.code === 'OTROS') return;
    this.subSearch.set('');
    this.selectedCategory.set(null);
    this.selectedSubcategory.set(null);
  }

  selectSubcategory(sub: ReportSubcategory): void {
    if (sub.id === 'otro_custom') {
      this.subSearch.set('');
      this.customMode.set(true);
      return;
    }
    this.selectedSubcategory.set(sub);
    this.comentarios.set('');
    this.selectedStatus.set('pendiente'); // reset cada vez
    this.showConfirmDialog.set(true);
  }

  async confirmCustomSubcategory(): Promise<void> {
    const text = this.customText().trim();
    if (!text) return;
    
    // Guardar permanentemente en la base de datos "otros" global
    const saved = await this.reportService.addOtrosCategory(text);
    
    this.customMode.set(false);
    this.selectSubcategory({ id: saved ? saved.id : 'custom_' + Date.now(), label: text });
  }

  editCustomCategory(e: Event, cat: ReportSubcategory): void {
    e.stopPropagation();
    this.editingCategory = cat;
    this.editText.set(cat.label);
    this.showEditDialog.set(true);
  }

  async confirmEdit(): Promise<void> {
    const newName = this.editText().trim();
    if (!newName || !this.editingCategory) return;
    if (newName !== this.editingCategory.label) {
      await this.reportService.updateOtrosCategory(this.editingCategory.id, newName);
      await this.loadOtrosCategories();
    }
    this.showEditDialog.set(false);
    this.editingCategory = null;
    this.editText.set('');
  }

  cancelEdit(): void {
    this.showEditDialog.set(false);
    this.editingCategory = null;
    this.editText.set('');
  }

  async deleteCustomCategory(e: Event, id: string): Promise<void> {
    e.stopPropagation();
    if (window.confirm('¿Seguro que deseas eliminar esta opción? Ya no le aparecerá a nadie.')) {
      await this.reportService.deleteOtrosCategory(id);
      await this.loadOtrosCategories();
    }
  }

  closeDialog(): void {
    this.showConfirmDialog.set(false);
    this.selectedSubcategory.set(null);
  }

  submitReport(): void {
    const station = this.station();
    const cat = this.selectedCategory();
    const sub = this.selectedSubcategory();
    if (!station || !cat || !sub) return;

    this.isSubmitting.set(true);

    // Simulate small delay for UX
    setTimeout(() => {
      this.reportService.addReport({
        fecha: new Date().toISOString(),
        estacion: station.code,
        seccion: station.seccion,
        categoria: cat.id,
        categoriaLabel: cat.label,
        subcategoria: sub.label,
        comentarios: this.comentarios(),
        status: this.selectedStatus(),
      });

      this.isSubmitting.set(false);
      this.showConfirmDialog.set(false);
      this.showSuccess.set(true);
    }, 600);
  }

  scanAnother(): void {
    this.showSuccess.set(false);
    this.selectedSubcategory.set(null);
    this.comentarios.set('');
    this.customMode.set(false);
    this.customText.set('');
    // Si es estación OTROS, volver a cargar las subcategorías en lugar de mostrar el grid de categorías
    if (this.station()?.code === 'OTROS') {
      this.loadOtrosCategories();
    } else {
      this.selectedCategory.set(null);
    }
  }

  goToReports(): void {
    this.router.navigate(['/reports']);
  }

  today(): string {
    return new Date().toLocaleDateString('es-MX', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  nowTime(): string {
    return new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }

  getStatusLabel(status: string): string {
    return this.reportService.getStatusLabel(status as 'pendiente' | 'en_progreso' | 'finalizado');
  }
}
