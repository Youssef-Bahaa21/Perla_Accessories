import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-returns-policy',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './returns-policy.component.html',
})
export class ReturnsPolicyComponent implements OnInit {

  ngOnInit(): void {
    // Component functionality without SEO - ready for later implementation
  }
}