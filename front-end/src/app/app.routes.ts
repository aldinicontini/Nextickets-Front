import { Routes } from '@angular/router';
import { ReportFormComponent } from './pages/report-form/report-form.component';
import { ReportsTableComponent } from './pages/reports-table/reports-table.component';
import { QrGeneratorComponent } from './pages/qr-generator/qr-generator.component';

export const routes: Routes = [
  { path: '', redirectTo: 'qr', pathMatch: 'full' },
  { path: 'new', component: ReportFormComponent },
  { path: 'reports', component: ReportsTableComponent },
  { path: 'qr', component: QrGeneratorComponent },
  { path: '**', redirectTo: 'qr' }
];
