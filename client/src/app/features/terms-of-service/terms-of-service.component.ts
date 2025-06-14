import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-terms-of-service',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './terms-of-service.component.html',
  styleUrl: './terms-of-service.component.scss'
})
export class TermsOfServiceComponent implements OnInit {

  ngOnInit(): void {
    // Component functionality without SEO - ready for later implementation
  }
}
