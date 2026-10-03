import {
  Component, OnInit, signal, computed, inject, ElementRef, ViewChildren, QueryList, AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import QRCode from 'qrcode';
import { ALL_STATIONS, STATIONS_CONFIG, Station } from '../../models/report.models';

interface QRStation extends Station {
  qrDataUrl?: string;
  url: string;
}

@Component({
  selector: 'app-qr-generator',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './qr-generator.component.html',
  styleUrl: './qr-generator.component.css'
})
export class QrGeneratorComponent implements OnInit, AfterViewInit {
  private router = inject(Router);
  private messageService = inject(MessageService);

  sections = STATIONS_CONFIG.map(s => s.seccion);
  selectedSection = signal<string>('A');
  searchTerm = signal<string>('');
  baseUrl = signal<string>(this.getBaseUrl());
  isGenerating = signal(false);

  allStations: QRStation[] = ALL_STATIONS.map(s => ({
    ...s,
    url: `${this.getBaseUrl()}/new?estacion=${s.code}`
  }));

  visibleStations = computed(() => {
    const sec = this.selectedSection();
    const term = this.searchTerm().trim().toLowerCase();

    if (term) {
      // Global search: ignores section filter
      return this.allStations.filter(s => 
        s.code.toLowerCase().includes(term) || 
        s.numero.toString().includes(term)
      );
    }
    
    // Default: filter by section
    return this.allStations.filter(s => s.seccion === sec);
  });

  sectionCounts = computed(() => {
    const map: Record<string, number> = {};
    for (const cfg of STATIONS_CONFIG) {
      map[cfg.seccion] = cfg.count;
    }
    return map;
  });

  ngOnInit(): void {}

  async ngAfterViewInit(): Promise<void> {
    // Generate all QRs at once so global search works smoothly without broken images
    await this.generateAllQRs();
  }

  selectSection(sec: string): void {
    this.searchTerm.set(''); // Clear search when picking a section
    this.selectedSection.set(sec);
  }

  onSearchChange(val: string): void {
    this.searchTerm.set(val);
  }

  private async generateAllQRs(): Promise<void> {
    this.isGenerating.set(true);
    for (const station of this.allStations) {
      if (!station.qrDataUrl) {
        try {
          station.qrDataUrl = await QRCode.toDataURL(station.url, {
            width: 200,
            margin: 2,
            color: {
              dark: '#1e293b',
              light: '#ffffff',
            },
            errorCorrectionLevel: 'M',
          });
        } catch (e) {
          console.error('QR error', e);
        }
      }
    }
    this.isGenerating.set(false);
  }

  printStation(station: QRStation): void {
    if (!station.qrDataUrl) return;

    // Se abre inmediatamente en la misma cola del evento de click para evitar
    // que el celular (safari/chrome) lo detecte como popup malicioso
    const win = window.open('', '_blank');
    if (!win) {
      this.messageService.add({ severity: 'error', summary: 'Popup bloqueado', detail: 'Tu celular o navegador bloqueó la pestaña de impresión. Permite las ventanas emergentes (Popups) para continuar.' });
      return;
    }

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR ${station.code}</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap" rel="stylesheet">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: white; }
            .qr-print { text-align: center; padding: 30px; border: 2px solid #e2e8f0; border-radius: 16px; display: inline-block; }
            .brand { font-size: 14px; font-weight: 700; color: #64748b; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; }
            img { display: block; margin: 12px auto; border-radius: 8px; }
            .code { font-size: 28px; font-weight: 800; color: #1e293b; letter-spacing: 0.1em; margin: 8px 0 4px; }
            .section { font-size: 13px; color: #94a3b8; }
            .hint { font-size: 11px; color: #cbd5e1; margin-top: 10px; }
            @media print { body { background: white; } }
          </style>
        </head>
        <body>
          <div class="qr-print">
            <div class="brand">Nextickets — Soporte Técnico</div>
            <img src="${station.qrDataUrl}" width="200" height="200" alt="QR ${station.code}"/>
            <div class="code">${station.code}</div>
            <div class="section">Sección ${station.seccion} — Estación ${station.numero}</div>
            <div class="hint">Escanea para reportar un problema</div>
          </div>
          <script>
            window.onload = () => { window.print(); }
          </script>
        </body>
      </html>
    `);
    win.document.close();
  }

  async printSection(): Promise<void> {
    // Abrir ventana aquí, antes del primer 'await'
    // Los celulares bloquean TODO popup que ocurre después de promesas (async/await)
    const win = window.open('', '_blank');
    if (!win) {
      this.messageService.add({severity: 'error', summary: 'Popup bloqueado', detail: 'Tu navegador bloqueó la impresión. Permite las ventanas emergentes (Popups).'});
      return;
    }
    
    // Mientras genera QRs ponemos un mensajito en la nueva pestaña temporal
    win.document.write('<h2>Generando Códigos QR, por favor espere...</h2>');

    const stations = this.visibleStations();
    const sec = this.selectedSection();

    // Ensure all QRs are generated
    for (const s of stations) {
      if (!s.qrDataUrl) {
        s.qrDataUrl = await QRCode.toDataURL(s.url, { width: 180, margin: 2, color: { dark: '#1e293b', light: '#ffffff' } });
      }
    }

    const qrCards = stations.map(s => `
      <div class="qr-card">
        <img src="${s.qrDataUrl}" width="160" height="160" alt="${s.code}"/>
        <div class="code">${s.code}</div>
        <div class="label">Sección ${s.seccion} — Est. ${s.numero}</div>
      </div>
    `).join('');

    win.document.open(); // Limpia la pantalla de carga anterior
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Sección ${sec}</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap" rel="stylesheet">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', sans-serif; padding: 20px; background: white; }
            h1 { font-size: 18px; color: #1e293b; margin-bottom: 16px; }
            .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
            .qr-card { text-align: center; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px; break-inside: avoid; }
            img { display: block; margin: 6px auto; border-radius: 6px; }
            .code { font-size: 14px; font-weight: 800; color: #1e293b; letter-spacing: 0.05em; }
            .label { font-size: 10px; color: #94a3b8; margin-top: 3px; }
            @media print { @page { margin: 10mm; } }
          </style>
        </head>
        <body>
          <h1>Nextickets — QR Sección ${sec} (${stations.length} estaciones)</h1>
          <div class="grid">${qrCards}</div>
          <script>window.onload = () => { window.print(); }</script>
        </body>
      </html>
    `);
    win.document.close();
  }

  goToReports(): void {
    this.router.navigate(['/reports']);
  }

  private getBaseUrl(): string {
    // Forzado a la IP local para que el celular siempre pueda acceder
    // sin importar desde dónde se imprima el QR
    return 'https://nextickets.disbof.com';
  }

  // ── Navegación sin pestañas (Same Tab Routing) ──
  goToReport(station: QRStation): void {
    this.router.navigate(['/new'], { queryParams: { estacion: station.code } });
  }

  copyBaseUrl(): void {
    const url = `${this.baseUrl()}/new?estacion=[CODIGO]`;
    this.fallbackCopyTextToClipboard(this.baseUrl(), 'URL base copiada', this.baseUrl());
  }

  // Fallback super seguro para copiar texto en celulares cuando no están en HTTPS (ej. 172.19.x.x)
  private fallbackCopyTextToClipboard(text: string, summary: string, detail: string) {
    if (navigator.clipboard && window.isSecureContext) {
      // Método moderno, solo funciona en localhost o HTTPS
      navigator.clipboard.writeText(text).then(() => {
        this.messageService.add({ severity: 'success', summary, detail, life: 2500 });
      });
    } else {
      // Fallback universal estilo "hack" que funciona en celulares por IP local (HTTP)
      const textArea = document.createElement("textarea");
      textArea.value = text;
      // Prevenir scroll indeseado en celulares
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand('copy');
        if (successful) {
          this.messageService.add({ severity: 'success', summary, detail, life: 2500 });
        } else {
          throw new Error('Fallback failed');
        }
      } catch (err) {
        this.messageService.add({ severity: 'error', summary: 'Error al copiar', detail: 'Tu navegador no permite copiar automáticamente', life: 3000 });
      }
      document.body.removeChild(textArea);
    }
  }
}
