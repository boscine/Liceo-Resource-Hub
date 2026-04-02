import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { RouterModule }      from '@angular/router';
import { NavbarComponent }   from '../../../shared/navbar/navbar.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
})
export class FeedComponent implements OnInit {
  searchQuery    = '';
  activeCategory = 'All Resources';
  categories     = ['All Resources', 'Textbooks', 'Lab Tools', 'Lecture Notes', 'Art Supplies', 'Calculator', 'USB / Storage', 'Other'];

  // Placeholder posts until backend is connected
  posts = [
    { id: 1, status: 'OPEN',      title: 'Organic Chemistry 4th Ed. (Smith)',               description: 'Looking for a physical copy to borrow for the midterms. Prepared to trade for Physics volume 1...', category: 'TEXTBOOKS',   timeAgo: '2 hours ago',  resolved: false },
    { id: 2, status: 'FULFILLED', title: 'Arduino Starter Kit Components',                  description: 'Need a breadboard and jumper wires for the upcoming robotics lab. Any spare kits available?',       category: 'LAB TOOLS',   timeAgo: 'Yesterday',    resolved: true  },
    { id: 3, status: 'URGENT',    title: 'Anatomy & Physiology Dissection Kit',              description: 'Urgent request for the CON clinical laboratory sessions starting this Friday. Will return in excellent condition.', category: 'MEDICAL', timeAgo: '5 hours ago', resolved: false },
    { id: 4, status: 'OPEN',      title: 'Digital Illustration Stylus (Wacom compatible)',  description: 'My stylus stopped working right before the final plates. Does anyone have a spare Intuos compatible...', category: 'ART SUPPLIES', timeAgo: '12 hours ago', resolved: false },
    { id: 5, status: 'OPEN',      title: 'Law Review Notes: Constitutional Law',            description: 'Requesting comprehensive notes or flashcards for the upcoming Bar review simulations.',              category: 'NOTES',       timeAgo: '1 day ago',    resolved: false },
  ];

  constructor() {}

  ngOnInit() {}

  /** Posts filtered by the active category chip and the search query */
  get filteredPosts() {
    const cat = this.activeCategory.toUpperCase();
    const q   = this.searchQuery.trim().toUpperCase();
    return this.posts.filter(p => {
      const matchCat = cat === 'ALL RESOURCES' || p.category.toUpperCase() === cat;
      const matchQ   = !q ||
        p.title.toUpperCase().includes(q) ||
        p.description.toUpperCase().includes(q) ||
        p.category.toUpperCase().includes(q);
      return matchCat && matchQ;
    });
  }

  setCategory(cat: string) { this.activeCategory = cat; }

  getStatusClass(status: string) {
    return {
      'status-open':      status === 'OPEN',
      'status-fulfilled': status === 'FULFILLED',
      'status-urgent':    status === 'URGENT',
    };
  }
}