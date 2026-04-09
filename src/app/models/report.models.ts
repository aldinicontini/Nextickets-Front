// ==========================================
// DISBOF - Modelos de datos
// ==========================================

export type ReportStatus = 'pendiente' | 'en_progreso' | 'finalizado';

export type ReportCategory = 'huawei' | 'fallas_fisicas' | 'monitor' | 'internet';

export interface ReportSubcategory {
  id: string;
  label: string;
}

export interface ReportCategoryDef {
  id: ReportCategory;
  label: string;
  icon: string;
  color: string;
  gradient: string;
  subcategories: ReportSubcategory[];
}

export interface Report {
  id: string;
  fecha: string;          // ISO string
  estacion: string;       // e.g. DBA01
  seccion: string;        // e.g. A
  categoria: ReportCategory;
  categoriaLabel: string;
  subcategoria: string;
  comentarios: string;
  status: ReportStatus;
  creadoEn: string;       // ISO string
  actualizadoEn: string;  // ISO string
}

export interface Station {
  code: string;    // e.g. DBA01
  seccion: string; // e.g. A
  numero: number;  // e.g. 1
}

// ==========================================
// CATEGORIAS Y SUBCATEGORIAS
// ==========================================
export const REPORT_CATEGORIES: ReportCategoryDef[] = [
  {
    id: 'huawei',
    label: 'Huawei',
    icon: 'pi pi-phone',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
    subcategories: [
      { id: 'tel_desconectado', label: 'Teléfono desconectado / Softphone' },
      { id: 'herramientas', label: 'No cargan herramientas' },
      { id: 'conexion', label: 'Problemas en conexión' },
    ]
  },
  {
    id: 'fallas_fisicas',
    label: 'Fallas Físicas',
    icon: 'pi pi-desktop',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #b91c1c, #ef4444)',
    subcategories: [
      { id: 'mouse', label: 'No funciona mouse' },
      { id: 'teclado', label: 'No funciona teclado' },
      { id: 'equipo_pc', label: 'No funciona equipo / PC' },
      { id: 'diademas', label: 'No funcionan diademas' },
    ]
  },
  {
    id: 'monitor',
    label: 'Monitor',
    icon: 'pi pi-stop',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #b45309, #f59e0b)',
    subcategories: [
      { id: 'vga', label: 'No funciona VGA' },
      { id: 'adaptador', label: 'No funciona adaptador' },
      { id: 'monitor_falla', label: 'No funciona monitor' },
    ]
  },
  {
    id: 'internet',
    label: 'Internet',
    icon: 'pi pi-wifi',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #065f46, #10b981)',
    subcategories: [
      { id: 'intermitencia', label: 'Intermitencia en red' },
      { id: 'cable_danado', label: 'Cable de red dañado' },
      { id: 'configuracion', label: 'Configuración de red' },
    ]
  }
];

// ==========================================
// ESTACIONES (126 total)
// ==========================================
export const STATIONS_CONFIG: { seccion: string; count: number }[] = [
  { seccion: 'A', count: 6 },
  { seccion: 'B', count: 11 },
  { seccion: 'C', count: 12 },
  { seccion: 'D', count: 12 },
  { seccion: 'E', count: 12 },
  { seccion: 'F', count: 10 },
  { seccion: 'G', count: 6 },
  { seccion: 'H', count: 12 },
  { seccion: 'I', count: 12 },
  { seccion: 'J', count: 22 },
  { seccion: 'K', count: 11 },
  { seccion: 'OTROS', count: 1 },
];

export function generateAllStations(): Station[] {
  const stations: Station[] = [];
  for (const cfg of STATIONS_CONFIG) {
    if (cfg.seccion === 'OTROS') {
      stations.push({ code: 'OTROS', seccion: 'OTROS', numero: 0 });
      continue;
    }
    for (let i = 1; i <= cfg.count; i++) {
      const num = i.toString().padStart(2, '0');
      stations.push({
        code: `DB${cfg.seccion}${num}`,
        seccion: cfg.seccion,
        numero: i
      });
    }
  }
  return stations;
}

export const ALL_STATIONS: Station[] = generateAllStations();

export function isValidStation(code: string): boolean {
  return ALL_STATIONS.some(s => s.code === code.toUpperCase());
}

export function getStation(code: string): Station | undefined {
  return ALL_STATIONS.find(s => s.code === code.toUpperCase());
}
