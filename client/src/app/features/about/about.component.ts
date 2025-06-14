import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about.component.html',
})
export class AboutComponent implements OnInit {

  ngOnInit(): void {
    // Component functionality without SEO - ready for later implementation
  }
}