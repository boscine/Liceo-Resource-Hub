import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService }       from '../../../core/services/auth.service';
import { ApiService }        from '../../../core/services/api.service';
import { ToastService }      from '../../../core/services/toast.service';
import { NavbarComponent }   from '../../../shared/navbar/navbar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  displayName = '';
  email       = '';
  contacts: Array<{type: string, value: string}> = [];
  newContact: {type: string, value: string} = { type: 'messenger', value: '' };
  
  saving      = false;
  saved       = false;
  contactError = '';
  contactTypes = ['messenger', 'phone', 'other'];

  initialDisplayName = '';
  initialContactsStr = '';
  isAdmin = false;

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
          this.displayName = (user.displayName || user.display_name || '').trim() || 'User';
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
          this.displayName = tokenUser.displayName || tokenUser.display_name || 'User';
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

    if (this.newContact.type === 'messenger') {
      if (!val.includes('/') && !val.startsWith('http')) {
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
    const currentContactsStr = JSON.stringify(this.contacts);
    
    const hasDisplayNameChanged = this.displayName.trim() !== this.initialDisplayName.trim();
    const hasContactsChanged    = currentContactsStr !== this.initialContactsStr;

    if (!hasDisplayNameChanged && !hasContactsChanged) {
      this.toast.info('No changes were made to your profile.');
      return;
    }

    this.saving = true;
    this.api.put('/profile', { 
      displayName: this.displayName.trim(), 
      contacts: this.contacts
    }).subscribe({
      next: (res: any) => {
        this.saving = false;
        this.saved = true;
        this.toast.success('Your profile changes have been secured.');
        
        if (res?.user) {
          this.displayName = res.user.displayName;
          this.contacts = [...res.user.contacts];
        }

        this.initialDisplayName = this.displayName;
        this.initialContactsStr = JSON.stringify(this.contacts);
        
        setTimeout(() => {
          this.saved = false;
          this.cdr.detectChanges();
        }, 3000);
        this.cdr.detectChanges();
      },
      error: () => {
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}