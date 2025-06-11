import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-returns-policy',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-pink-50/30 via-white to-pink-50/30 py-12 relative overflow-hidden">
      <!-- Enhanced decorative elements -->
      <div class="absolute top-0 left-0 w-[40rem] h-[40rem] bg-gradient-to-br from-pink-100/20 to-pink-200/20 rounded-full filter blur-3xl opacity-60 transform -translate-x-1/2 -translate-y-1/2 float-element"></div>
      <div class="absolute bottom-0 right-0 w-[35rem] h-[35rem] bg-gradient-to-tl from-pink-100/20 to-pink-200/20 rounded-full filter blur-3xl opacity-50 transform translate-x-1/2 translate-y-1/2 float-element-delayed"></div>
      
      <div class="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        <!-- Enhanced Header -->
        <div class="text-center mb-16">
          <div class="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-pink-200 text-pink-700 text-sm font-semibold px-6 py-2 rounded-full mb-6 border border-pink-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Returns & Exchanges
          </div>
          
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight">
            Returns & <span class="relative inline-block bg-gradient-to-r from-pink-600 via-pink-500 to-pink-800 bg-clip-text text-transparent">
              Exchanges
              <span class="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full"></span>
            </span>
          </h1>
          
          <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our policy regarding returns, exchanges, and refunds for your peace of mind.
          </p>
        </div>

        <!-- Main Content -->
        <div class="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 sm:p-12 mb-12 relative overflow-hidden">
          <!-- Decorative corner accent -->
          <div class="absolute top-0 right-0 w-32 h-32 overflow-hidden">
            <div class="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-pink-400/20 to-pink-600/20 transform rotate-45 translate-x-8 -translate-y-8"></div>
          </div>
          
          <!-- Introduction -->
          <div class="mb-10 text-center">
            <p class="text-lg text-gray-800 leading-relaxed max-w-3xl mx-auto">
              At Perla Accessories, we want you to be completely satisfied with your purchase. Please read our returns and exchanges policy carefully.
            </p>
          </div>
          
          <!-- Policy Sections -->
          <div class="space-y-8">
            <!-- Section 1 -->
            <div class="bg-white/40 rounded-xl p-6 border border-pink-100/50 hover:shadow-md transition-all duration-300">
              <div class="flex items-start">
                <div class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div class="flex-1">
                  <h2 class="text-xl font-semibold text-gray-900 mb-3">Returns Policy</h2>
                  <p class="text-gray-600 leading-relaxed">We do not offer returns or exchanges except in the case of receiving an incorrect item. If you receive the wrong item, please contact us on the same day you received it and inform us that the item is incorrect. In this case, we will take full responsibility to replace it.</p>
                </div>
              </div>
            </div>
            
            <!-- Section 2 -->
            <div class="bg-white/40 rounded-xl p-6 border border-pink-100/50 hover:shadow-md transition-all duration-300">
              <div class="flex items-start">
                <div class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div class="flex-1">
                  <h2 class="text-xl font-semibold text-gray-900 mb-3">Unsatisfactory Items</h2>
                  <p class="text-gray-600 leading-relaxed">If you receive an order and you are not satisfied with the item in any way, please contact us on the same day you received it. In this case, the full shipping cost will be your responsibility. Please note that some items may not be eligible for return based on their condition or nature.</p>
                </div>
              </div>
            </div>
            
            <!-- Section 3 -->
            <div class="bg-white/40 rounded-xl p-6 border border-pink-100/50 hover:shadow-md transition-all duration-300">
              <div class="flex items-start">
                <div class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div class="flex-1">
                  <h2 class="text-xl font-semibold text-gray-900 mb-3">Return Process</h2>
                  <p class="text-gray-600 leading-relaxed">To initiate a return, please contact our customer service team on the same day of receiving your order. We will provide you with instructions on how to proceed with the return. Returns initiated after the same-day notification period may not be accepted.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Important Note -->
          <div class="mt-10 bg-gradient-to-r from-pink-500/10 to-pink-600/10 border border-pink-200 rounded-xl p-6">
            <div class="flex items-start">
              <div class="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-pink-800 mb-2">Important Notice</h3>
                <p class="text-pink-700">Please contact us on the same day you receive your order if you have any concerns. This ensures we can provide the best possible assistance and resolution.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Section -->
        <div class="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 sm:p-12 mb-12">
          <div class="text-center mb-8">
            <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4 relative inline-block">
              Contact Us
              <span class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full"></span>
            </h2>
            <p class="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              If you have any questions about our returns and exchanges policy, please contact us:
            </p>
          </div>
          
          <div class="flex flex-wrap justify-center gap-6">
            <a href="https://www.instagram.com/perlaaccessoriesboutique?igsh=MXBzYmU2YmRvZXc5cw==" target="_blank" rel="noopener" 
               class="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-medium hover:from-pink-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-pink-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.2c3.2 0 3.584.012 4.85.07 3.24.148 4.771 1.671 4.919 4.919.058 1.267.069 1.645.069 4.849s-.012 3.582-.069 4.849c-.149 3.245-1.679 4.771-4.919 4.919-1.265.058-1.644.07-4.85.07s-3.584-.012-4.849-.07c-3.245-.148-4.771-1.674-4.919-4.919-.058-1.267-.07-1.645-.07-4.849s.013-3.582.07-4.849c.148-3.245 1.674-4.771 4.919-4.919 1.267-.058 1.645-.07 4.849-.07zM12 0c-3.259 0-3.667.013-4.947.072-4.354.2-6.782 2.618-6.98 6.979C0 8.333 0 8.742 0 12c0 3.259.013 3.668.072 4.948.2 4.354 2.618 6.782 6.979 6.98 1.28.059 1.689.072 4.949.072 3.259 0 3.668-.013 4.948-.072 4.354-.198 6.782-2.626 6.98-6.98.058-1.28.072-1.689.072-4.948 0-3.258-.014-3.667-.072-4.947-.198-4.362-2.626-6.78-6.98-6.98C15.667.013 15.259 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4A6.2 6.2 0 0 0 12 5.8zm0 10.2a4 4 0 1 1 0-8.001 4 4 0 0 1 0 8zm6.4-11.845a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
              </svg>
              <span class="relative">
                Instagram
                <span class="absolute inset-x-0 -bottom-0.5 h-0.5 bg-pink-200 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </span>
            </a>
            
            <a href="https://www.tiktok.com/@perlaaccesories0?_t=ZS-8vtSpUwLtoO&_r=1" target="_blank" rel="noopener" 
               class="group inline-flex items-center px-6 py-3 bg-white text-gray-700 border-2 border-pink-200 rounded-xl font-medium hover:bg-pink-50 hover:border-pink-300 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-pink-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.37 6.37 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.95 4.37l.02.01v-9.1a8.32 8.32 0 0 0 5.62 2.19V9.68a4.85 4.85 0 0 1-2.83-.99"/>
              </svg>
              <span class="relative">
                TikTok
                <span class="absolute inset-x-0 -bottom-0.5 h-0.5 bg-pink-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </span>
            </a>
          </div>
        </div>
        
        <!-- Enhanced Back Button -->
        <div class="text-center">
          <a routerLink="/" class="group inline-flex items-center bg-gradient-to-r from-pink-500 to-pink-600 text-white px-8 py-4 rounded-xl font-medium hover:from-pink-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-pink-500/30 relative overflow-hidden">
            <span class="relative z-10 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </span>
            <div class="absolute inset-0 w-full h-full bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
          </a>
        </div>
      </div>
    </div>

    <!-- Enhanced CSS Animations -->
    <style>
      @keyframes float-element {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(2deg); }
      }
      
      @keyframes float-element-delayed {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-15px) rotate(-2deg); }
      }
      
      .float-element {
        animation: float-element 8s ease-in-out infinite;
      }
      
      .float-element-delayed {
        animation: float-element-delayed 10s ease-in-out infinite 2s;
      }
      
      .backdrop-blur-sm {
        backdrop-filter: blur(12px);
      }
    </style>
  `,
})
export class ReturnsPolicyComponent { }