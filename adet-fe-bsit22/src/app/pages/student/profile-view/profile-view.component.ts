import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { FooterComponent } from '../../../shared/footer/footer.component';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.scss']
})
export class ProfileViewComponent implements OnInit {
  user: any = null;
  loading = true;
  error = '';
  isOwnProfile = false;
  loggedInUser: any = null;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  private lastFetchedId: string | null = null;

  ngOnInit() {
    this.loggedInUser = this.auth.getUser();

    // Use paramMap subscription to allow navigating between different profiles
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      
      // Optimization: Avoid redundant fetches if the ID hasn't changed
      if (id === this.lastFetchedId && !this.error) return;
      
      const numericId = parseInt(id || '', 10);

      if (id && !isNaN(numericId) && id !== 'undefined' && id !== 'null') {
        this.fetchProfile(id);
      } else {
        console.error('Invalid profile ID:', id);
        this.error = 'Invalid scholar profile requested.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  fetchProfile(id: string) {
    this.lastFetchedId = id;
    this.loading = true;
    this.error = ''; // Reset error state
    this.user = null; // Clear previous user data
    this.cdr.detectChanges();

    this.api.get<any>(`/profile/${id}`).subscribe({
      next: (data) => {
        this.user = data;
        this.isOwnProfile = this.loggedInUser && (this.loggedInUser.id == this.user.id);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load profile:', err);
        this.error = 'Unable to load profile. The user may not exist or the connection was lost.';
        this.loading = false;
        this.lastFetchedId = null; // Allow retry
        this.cdr.detectChanges();
      }
    });
  }

  getAvatarInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }
}
