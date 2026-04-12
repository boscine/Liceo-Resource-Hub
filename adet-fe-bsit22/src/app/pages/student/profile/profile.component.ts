import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService }       from '../../../core/services/auth.service';
import { ApiService }        from '../../../core/services/api.service';
import { ToastService }      from '../../../core/services/toast.service';
import { NavbarComponent }   from '../../../shared/navbar/navbar.component';
import { FooterComponent }   from '../../../shared/footer/footer.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  displayName = '';
  email       = '';
  contacts: Array<{type: string, value: string}> = [];
  newContact: {type: string, value: string} = { type: 'messenger', value: '' };
  
  college     = '';
  initialCollege = '';
  
  saving      = false;
  saved       = false;
  contactError = '';
  contactTypes = ['messenger', 'phone', 'other'];
  
  colleges = [
    'College of Arts and Sciences',
    'College of Business and Accountancy',
    'College of Education',
    'College of Engineering',
    'College of Information Technology',
    'College of Nursing',
    'College of Medical Laboratory Science',
    'College of Radiologic Technology',
    'College of Rehabilitation Sciences',
    'College of Criminal Justice',
    'School of Graduate Studies',
    'College of Law'
  ];

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
          this.college = user.college || '';
          this.contacts = user.contacts ? [...user.contacts] : [];
          
          this.initialDisplayName = this.displayName;
          this.initialCollege = this.college;
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

  addContact() {
    this.contactError = '';
    let val = this.newContact.value?.trim();
    if (!val) return;

    if (this.contacts.length >= 5) {
      this.contactError = 'Scholarly limit exceeded: Maximum 5 contact methods allowed.';
      return;
    }

    if (this.newContact.type === 'messenger') {
      // Improved logic: only prefix if it's a simple username/ID
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
    this.cdr.detectChanges();
  }

  removeContact(i: number) {
    this.contacts.splice(i, 1);
    this.cdr.detectChanges();
  }

  onSave() {
    if (this.saving) return;
    this.validationErrors = {};
    const currentContactsStr = JSON.stringify(this.contacts);
    
    const hasDisplayNameChanged = this.displayName.trim() !== this.initialDisplayName.trim();
    const hasCollegeChanged     = this.college !== this.initialCollege;
    const hasContactsChanged    = currentContactsStr !== this.initialContactsStr;

    if (!hasDisplayNameChanged && !hasCollegeChanged && !hasContactsChanged) {
      this.toast.info('No changes were made to your profile.');
      return;
    }

    this.saving = true;
    this.api.put('/profile', { 
      displayName: this.displayName.trim(), 
      college: this.college,
      contacts: this.contacts
    }).subscribe({
      next: (res: any) => {
        this.saving = false;
        this.saved = true;
        this.toast.success('Your profile changes have been secured.');
        
        if (res?.user) {
          this.displayName = res.user.displayName;
          this.college = res.user.college || '';
          this.contacts = [...res.user.contacts];
        }

        this.initialDisplayName = this.displayName;
        this.initialCollege = this.college;
        this.initialContactsStr = JSON.stringify(this.contacts);
        
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
          const msg = err?.error?.message || 'Failed to sync profile changes.';
          this.toast.error(msg);
        }
        this.cdr.detectChanges();
      }
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}