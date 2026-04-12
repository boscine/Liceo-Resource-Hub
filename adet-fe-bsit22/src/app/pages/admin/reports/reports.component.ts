import { Component, OnInit, ChangeDetectorRef }    from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { FooterComponent } from '../../../shared/footer/footer.component';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements OnInit {
  activeTab = 'PENDING';
  tabs      = ['PENDING', 'REVIEWED', 'DISMISSED'];
  reports: any[] = [];
  loading = true;

  get pendingCount() {
    return this.reports.filter(r => r.status === 'pending').length;
  }

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.fetchReports();
  }

  fetchReports() {
    this.loading = true;
    this.api.get<any[]>('/admin/reports').subscribe({
      next: (data) => {
        this.reports = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load reports', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  setTab(tab: string) { this.activeTab = tab; }
  
  getFiltered() { 
    return this.reports.filter(r => r.status === this.activeTab.toLowerCase()); 
  }

  updateReportStatus(report: any, status: string) {
    // Optimistic UI update
    const previousStatus = report.status;
    report.status = status;
    
    this.api.put(`/admin/reports/${report.id}`, { status }).subscribe({
      next: () => this.cdr.detectChanges(),
      error: (err) => {
        console.error('Failed to update report status', err);
        report.status = previousStatus; // Revert on failure
        this.cdr.detectChanges();
      }
    });
  }

  dismiss(r: any) { this.updateReportStatus(r, 'dismissed'); }
  review(r: any)  { this.updateReportStatus(r, 'reviewed'); }
}
