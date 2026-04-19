import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService }       from '../../../core/services/auth.service';
import { ApiService }        from '../../../core/services/api.service';
import { ToastService }      from '../../../core/services/toast.service';
import { NavbarComponent }   from '../../../shared/navbar/navbar.component';
import { FooterComponent }   from '../../../shared/footer/footer.component';
import { getInitials }       from '../../../core/utils';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  getInitials = getInitials;
  displayName = 'Scholar';
  email       = '';
  contacts: Array<{type: string, value: string}> = [];
  newContact: {type: string, value: string} = { type: 'messenger', value: '' };
  
  // Security
  password = '';
  confirmPassword = '';
  otp = '';
  passwordStep: 'initial' | 'requested' | 'verified' = 'initial';
  otpLoading = false;
  otpVerified = false;
  
  saving      = false;
  saved       = false;
  contactSaving = false;
  contactError = '';
  contactTypes = ['messenger', 'phone', 'telegram', 'whatsapp', 'instagram', 'viber', 'other'];
  

  initialDisplayName = '';
  initialContactsStr = '';
  isAdmin = false;
  validationErrors: any = {};

  constructor(
    private auth: AuthService, 
    private router: Router, 
    private api: ApiService, 
    private cdr: ChangeDetectorRef,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.isAdmin = this.auth.isAdmin();
    this.fetchProfile();
  }

  fetchProfile() {
    this.api.get<any>('/profile').subscribe({
      next: (user) => {
        if (user) {
          this.displayName = (user.displayName || '').trim() || 'User';
          this.email = user.email || '';
          this.contacts = user.contacts ? [...user.contacts] : [];
          
          this.initialDisplayName = this.displayName;
          this.initialContactsStr = JSON.stringify(this.contacts);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load profile data:', err);
        const tokenUser = this.auth.getUser() as any;
        if (tokenUser) {
          this.displayName = tokenUser.displayName || 'User';
          this.initialDisplayName = this.displayName;
          this.email = tokenUser.email || '';
        }
        this.cdr.detectChanges();
      }
    });
  }

  syncContacts() {
    this.contactSaving = true;
    this.api.put('/profile', { 
      // Use initialDisplayName so name changes remain manual/intentional
      displayName: this.initialDisplayName, 
      contacts: this.contacts
    }).subscribe({
      next: (res: any) => {
        this.contactSaving = false;
        if (res?.user) {
          this.contacts = [...res.user.contacts];
        }
        this.initialContactsStr = JSON.stringify(this.contacts);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.contactSaving = false;
        const msg = err?.error?.message || 'Failed to sync contact changes.';
        this.toast.error(msg);
        // Rollback or refresh on error?
        this.fetchProfile();
        this.cdr.detectChanges();
      }
    });
  }

  addContact() {
    if (this.contactSaving) return;
    this.contactError = '';
    let val = this.newContact.value?.trim();
    if (!val) return;

    if (this.contacts.length >= 5) {
      this.contactError = 'Scholarly limit exceeded: Maximum 5 contact methods allowed.';
      return;
    }

    if (this.newContact.type === 'messenger') {
      if (!val.includes('/') && !val.includes('.') && !val.startsWith('http')) {
        val = `m.me/${val}`;
      }
    }

    if (val.length < 3) {
      this.contactError = 'Contact value is too short.';
      return;
    }

    const exists = this.contacts.find((c: {type: string, value: string}) => 
      c.type.toLowerCase() === this.newContact.type.toLowerCase() && 
      c.value.toLowerCase() === val.toLowerCase()
    );
    
    if (exists) {
      this.contactError = 'This contact method already exists.';
      return;
    }

    if (this.newContact.type === 'phone') {
      const numericOnly = val.replace(/\D/g, '');
      if (numericOnly.length < 7) {
        this.contactError = 'Please enter a valid phone number (at least 7 digits).';
        return;
      }
    }

    this.contacts.push({ type: this.newContact.type, value: val });
    this.newContact = { type: 'messenger', value: '' };
    this.contactError = '';
    
    this.syncContacts();
    this.cdr.detectChanges();
  }

  removeContact(i: number) {
    if (this.contactSaving) return;
    this.contacts.splice(i, 1);
    this.syncContacts();
    this.cdr.detectChanges();
  }

  onSave() {
    if (this.saving) return;
    const hasDisplayNameChanged = this.displayName.trim() !== this.initialDisplayName.trim();

    if (!hasDisplayNameChanged) {
      this.toast.info('No changes were made to your identity.');
      return;
    }

    // ── ANTI-SPAM LOGIC (7-Day Cooldown) ────────────────────────────────────
    const lastChangeStr = localStorage.getItem('ac_name_last_change');
    if (lastChangeStr) {
      const lastChange = new Date(lastChangeStr);
      const now = new Date();
      const diffDays = (now.getTime() - lastChange.getTime()) / (1000 * 3600 * 24);
      
      if (diffDays < 7) {
        const remaining = Math.ceil(7 - diffDays);
        this.toast.error(`Institutional Protocol: Your scholarly name was recently updated. Please wait ${remaining} more day(s) before another modification.`);
        return;
      }
    }

    this.saving = true;
    this.api.put('/profile', { 
      displayName: this.displayName.trim(), 
      contacts: this.contacts
    }).subscribe({
      next: (res: any) => {
        this.saving = false;
        this.saved = true;
        this.toast.success('Your scholastic identity has been updated.');
        
        if (res?.user) {
          this.displayName = res.user.displayName;
          this.initialDisplayName = this.displayName;
          // Record change time for spam prevention
          localStorage.setItem('ac_name_last_change', new Date().toISOString());
        }

        setTimeout(() => {
          this.saved = false;
          this.cdr.detectChanges();
        }, 3000);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.saving = false;
        if (err?.status === 400 && err?.error?.errors) {
          this.validationErrors = err.error.errors;
          this.toast.error('Validation failed. Please check the highlighted fields.');
        } else {
          const msg = err?.error?.message || 'Failed to sync identity changes.';
          this.toast.error(msg);
        }
        this.cdr.detectChanges();
      }
    });
  }

  requestPasswordChange() {
    this.otpLoading = true;
    this.api.post('/profile/request-password-change', {}).subscribe({
      next: (res: any) => {
        this.otpLoading = false;
        this.passwordStep = 'requested';
        this.toast.success(res.message || 'Scholarly validation code dispatched.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.otpLoading = false;
        this.toast.error(err?.error?.message || 'Failed to initiate security protocol.');
        this.cdr.detectChanges();
      }
    });
  }

  verifyPasswordAndChange() {
    if (!this.otp || this.otp.length !== 6) {
      this.toast.error('Please enter the 6-digit validation code.');
      return;
    }
    if (!this.password || this.password.length < 8) {
      this.toast.error('New restoration code must be at least 8 characters.');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.toast.error('Credential mismatch: New passwords do not match.');
      return;
    }

    this.otpLoading = true;
    this.api.post('/profile/verify-password-change', {
      otp: this.otp,
      newPassword: this.password
    }).subscribe({
      next: (res: any) => {
        this.otpLoading = false;
        this.passwordStep = 'initial'; // Reset back or to a success state
        this.password = '';
        this.confirmPassword = '';
        this.otp = '';
        this.toast.success(res.message || 'Credentials updated successfully.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.otpLoading = false;
        this.toast.error(err?.error?.message || 'Verification failed.');
        this.cdr.detectChanges();
      }
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}