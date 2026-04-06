import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { RouterModule }      from '@angular/router';
import { AuthService }       from '../../../core/services/auth.service';
import { ApiService }        from '../../../core/services/api.service';
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
  saveError   = '';
  contactError = '';
  contactTypes = ['messenger', 'phone', 'other'];

  initialDisplayName = '';
  initialContactsStr = '';

  constructor(private auth: AuthService, private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.fetchProfile();
  }

  fetchProfile() {
    this.api.get<any>('/profile').subscribe({
      next: (user) => {
        if (user) {
          this.displayName = user.displayName || user.display_name || user.name || 'User';
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
          this.displayName = tokenUser.display_name || 'User';
          this.email = tokenUser.email || '';
        }
        this.cdr.detectChanges();
      }
    });
  }

  addContact() {
    this.contactError = '';
    const val = this.newContact.value?.trim();
    if (!val) return;

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
  }

  onSave() {
    this.saveError = '';
    const currentContactsStr = JSON.stringify(this.contacts);
    
    if (this.displayName.trim() === this.initialDisplayName.trim() && currentContactsStr === this.initialContactsStr) {
      this.saveError = 'No changes detected. Please modify your information before saving.';
      return;
    }

    this.saving = true;
    this.api.put('/profile', { displayName: this.displayName, contacts: this.contacts }).subscribe({
      next: () => {
        this.saving = false;
        this.saved = true;
        this.initialDisplayName = this.displayName;
        this.initialContactsStr = currentContactsStr;
        
        setTimeout(() => {
          this.saved = false;
          this.cdr.detectChanges();
        }, 3000);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.saving = false;
        this.saveError = err.error?.message || 'Failed to update profile. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  logout() {
    this.auth.logout();
  }
}