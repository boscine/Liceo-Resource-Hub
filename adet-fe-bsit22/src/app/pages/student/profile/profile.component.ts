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
export class ProfileComponent implements OnInit { // Ensure 'export' is here
  displayName = '';
  email       = '';
  contacts: any[] = []; // Initialized as empty array
  newContact  = { type: 'messenger', value: '' };
  saving      = false;
  saved       = false;
  saveError   = '';
  contactTypes = ['messenger', 'phone', 'other'];

  initialDisplayName = '';
  initialContactsStr = '';

  constructor(private auth: AuthService, private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const user = this.auth.getUser();
    if (user) {
      // Use type casting (user as any) if the interface still complains
      const userData = user as any; 
      this.displayName = userData.display_name || userData.displayName || userData.name || 'User';
      this.email = userData.email || '';
      
      if (userData.contacts && userData.contacts.length > 0) {
        this.contacts = [...userData.contacts];
      } else {
        this.contacts = [];
      }
      this.initialDisplayName = this.displayName;
      this.initialContactsStr = JSON.stringify(this.contacts);
    }
  }

  addContact() {
    if (this.newContact.value) {
      this.contacts.push({ ...this.newContact });
      this.newContact = { type: 'messenger', value: '' };
    }
  }

  removeContact(i: number) {
    this.contacts.splice(i, 1);
  }

  onSave() {
    this.saveError = '';
    
    // Validate if anything changed
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