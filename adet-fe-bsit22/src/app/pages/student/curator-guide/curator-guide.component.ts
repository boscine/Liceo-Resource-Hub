import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';

@Component({
  selector: 'app-curator-guide',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './curator-guide.component.html',
  styleUrls: ['./curator-guide.component.scss']
})
export class CuratorGuideComponent {}
