import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { RouterModule }      from '@angular/router';
import { AuthService }       from '../../../core/services/auth.service';
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
  contactTypes = ['messenger', 'phone', 'other'];

  constructor(private auth: AuthService) {}

  ngOnInit() {
    const user = this.auth.getUser();
    if (user) {
      // Use type casting (user as any) if the interface still complains
      const userData = user as any; 
      this.displayName = userData.display_name || userData.displayName || userData.name || 'User';
      this.email = userData.email || '';
      
      if (userData.contacts && userData.contacts.length > 0) {
        this.contacts = [...userData.contacts];
      }
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
    this.saving = true;
    setTimeout(() => {
      this.saving = false;
      this.saved = true;
      setTimeout(() => (this.saved = false), 3000);
    }, 800);
  }

  logout() {
    this.auth.logout();
  }
}