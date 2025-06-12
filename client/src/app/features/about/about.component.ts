import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-pink-50/30 via-white to-pink-50/30 py-12 relative overflow-hidden">
      <!-- Enhanced decorative elements -->
      <div class="absolute top-0 left-0 w-[40rem] h-[40rem] bg-gradient-to-br from-pink-100/20 to-pink-200/20 rounded-full filter blur-3xl opacity-60 transform -translate-x-1/2 -translate-y-1/2 float-element"></div>
      <div class="absolute bottom-0 right-0 w-[35rem] h-[35rem] bg-gradient-to-tl from-pink-100/20 to-pink-200/20 rounded-full filter blur-3xl opacity-50 transform translate-x-1/2 translate-y-1/2 float-element-delayed"></div>
      
      <div class="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <!-- Enhanced Hero Header -->
        <div class="text-center mb-16">
          <div class="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-pink-200 text-pink-700 text-sm font-semibold px-6 py-2 rounded-full mb-6 border border-pink-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Our Story
          </div>
          
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight">
            About <span class="relative inline-block bg-gradient-to-r from-pink-600 via-pink-500 to-pink-800 bg-clip-text text-transparent">
              Perla
              <span class="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full"></span>
            </span>
          </h1>
          
          <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Get to know the story behind our unique accessories brand that's been shining for three years.
          </p>
        </div>

        <!-- Main Story Section -->
        <div class="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 sm:p-12 mb-12 relative overflow-hidden">
          <!-- Decorative corner accent -->
          <div class="absolute top-0 right-0 w-32 h-32 overflow-hidden">
            <div class="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-pink-400/20 to-pink-600/20 transform rotate-45 translate-x-8 -translate-y-8"></div>
          </div>
          
          <!-- Featured Image -->
          <div class="mb-10 flex justify-center">
            <div class="w-full max-w-2xl h-80 overflow-hidden rounded-2xl shadow-xl relative group">
              <img src="about.png" alt="Perla Accessories" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                   onerror="this.src='assets/images/placeholder.jpg'; this.onerror='';" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>
          
          <!-- Introduction -->
          <div class="mb-12 text-center">
            <p class="text-xl md:text-2xl text-gray-800 mb-6 font-light leading-relaxed">
              We're Perla, a brand that's been shining for three years. We're all about bringing you unique, standout pieces you won't find anywhere else.
            </p>
            
            <p class="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Every accessory you pick should feel like it was made just for you, because we believe in the magic of one of a kind style. That's why we focus on <span class="text-pink-600 font-semibold">limited edition pieces</span>, so you can always rock something different 🌸🎀🩷
            </p>
          </div>
        </div>

        <!-- Timeline Section -->
        <div class="mb-16">
          <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4 relative inline-block">
              Our Journey
              <span class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full"></span>
            </h2>
            <p class="text-gray-600 max-w-2xl mx-auto">Three years of creating beautiful, unique accessories</p>
          </div>
          
          <div class="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 sm:p-12">
            <div class="relative">
              <!-- Timeline line -->
              <div class="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-300 to-pink-500"></div>
              
              <!-- Timeline items -->
              <div class="space-y-12">
                <div class="relative flex items-start">
                  <div class="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div class="ml-8">
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">The Beginning</h3>
                    <p class="text-gray-600">Started with a vision to create unique, handcrafted accessories that stand out from the crowd.</p>
                  </div>
                </div>
                
                <div class="relative flex items-start">
                  <div class="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                    </svg>
                  </div>
                  <div class="ml-8">
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">Building Our Identity</h3>
                    <p class="text-gray-600">Developed our signature style focusing on limited edition pieces and premium quality craftsmanship.</p>
                  </div>
                </div>
                
                <div class="relative flex items-start">
                  <div class="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div class="ml-8">
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">Today</h3>
                    <p class="text-gray-600">Three years strong, continuing to create beautiful accessories that help you express your unique style.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mission & Values Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <!-- Our Mission -->
          <div class="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 hover:shadow-xl transition-all duration-300">
            <div class="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p class="text-gray-600 leading-relaxed">To create beautiful, high-quality accessories that help you express your unique personality and style while offering exceptional customer service.</p>
          </div>
          
          <!-- Our Values -->
          <div class="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 hover:shadow-xl transition-all duration-300">
            <div class="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Our Values</h2>
            <ul class="space-y-3">
              <li class="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-pink-500 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-600">Quality craftsmanship in every piece</span>
              </li>
              <li class="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-pink-500 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-600">Uniqueness that sets you apart</span>
              </li>
              <li class="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-pink-500 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-600">Customer satisfaction is our top priority</span>
              </li>
              <li class="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-pink-500 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-600">Affordability without compromising quality</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- What Makes Us Different Section -->
        <div class="mb-16">
          <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4 relative inline-block">
              What Makes Us Different
              <span class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full"></span>
            </h2>
            <p class="text-gray-600 max-w-3xl mx-auto">
              Each Perla piece is thoughtfully designed to enhance your personal style with elegance and sophistication.
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Premium Quality -->
            <div class="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 text-center group hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
              <div class="w-20 h-20 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-800 mb-3 group-hover:text-pink-600 transition-colors">Premium Quality</h3>
              <p class="text-gray-600">Crafted with the finest materials for lasting beauty and durability. Each piece is meticulously inspected to ensure perfection.</p>
            </div>
            
            <!-- Handcrafted Excellence -->
            <div class="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 text-center group hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
              <div class="w-20 h-20 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-800 mb-3 group-hover:text-pink-600 transition-colors">Handcrafted Excellence</h3>
              <p class="text-gray-600">Every accessory is carefully handcrafted by skilled artisans, ensuring attention to detail and superior craftsmanship.</p>
            </div>
            
            <!-- Limited Edition -->
            <div class="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 text-center group hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
              <div class="w-20 h-20 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-800 mb-3 group-hover:text-pink-600 transition-colors">Limited Edition Pieces</h3>
              <p class="text-gray-600">Exclusive, limited edition collections ensure you'll always have something unique that stands out from the crowd.</p>
            </div>
          </div>
        </div>

        <!-- Design Philosophy Section -->
        <div class="mb-16">
          <div class="bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl shadow-xl p-8 sm:p-12 text-white relative overflow-hidden">
            <!-- Background pattern -->
            <div class="absolute inset-0 opacity-10">
              <div class="absolute inset-0" style="background-image: radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px); background-size: 50px 50px;"></div>
            </div>
            
            <div class="relative z-10 text-center">
              <h2 class="text-3xl md:text-4xl font-bold mb-6">Our Design Philosophy</h2>
              <p class="text-xl md:text-2xl mb-8 text-pink-100 font-light leading-relaxed max-w-4xl mx-auto">
                "We believe accessories should be as unique as you are. Express your individuality with our exclusive collections."
              </p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
                <div class="flex items-start">
                  <div class="flex-shrink-0 w-3 h-3 bg-pink-200 rounded-full mt-2 mr-4"></div>
                  <div>
                    <h4 class="font-semibold mb-2 text-pink-100">One-of-a-Kind Style</h4>
                    <p class="text-pink-100 opacity-90">Every piece is designed to help you express your unique personality and stand out with confidence.</p>
                  </div>
                </div>
                <div class="flex items-start">
                  <div class="flex-shrink-0 w-3 h-3 bg-pink-200 rounded-full mt-2 mr-4"></div>
                  <div>
                    <h4 class="font-semibold mb-2 text-pink-100">Thoughtful Creation</h4>
                    <p class="text-pink-100 opacity-90">Each accessory is thoughtfully designed with attention to detail and elegance in mind.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Social Media Section -->
        <div class="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 sm:p-12 mb-12">
          <div class="text-center mb-8">
            <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4 relative inline-block">
              Connect With Us
              <span class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full"></span>
            </h2>
            <p class="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Stay connected with us on social media for the latest releases, styling tips, and special offers.
            </p>
          </div>
          
          <div class="flex flex-wrap justify-center gap-6">
            <a href="https://www.instagram.com/perlaaccessoriesboutique?igsh=MXBzYmU2YmRvZXc5cw==" target="_blank" rel="noopener" 
               class="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-medium hover:from-pink-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-pink-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.2c3.2 0 3.584.012 4.85.07 3.24.148 4.771 1.671 4.919 4.919.058 1.267.069 1.645.069 4.849s-.012 3.582-.069 4.849c-.149 3.245-1.679 4.771-4.919 4.919-1.265.058-1.644.07-4.85.07s-3.584-.012-4.849-.07c-3.245-.148-4.771-1.674-4.919-4.919-.058-1.267-.07-1.645-.07-4.849s.013-3.582.07-4.849c.148-3.245 1.674-4.771 4.919-4.919 1.267-.058 1.645-.07 4.849-.07zM12 0c-3.259 0-3.667.013-4.947.072-4.354.2-6.782 2.618-6.98 6.979C0 8.333 0 8.742 0 12c0 3.259.013 3.668.072 4.948.2 4.354 2.618 6.782 6.979 6.98 1.28.059 1.689.072 4.949.072 3.259 0 3.668-.013 4.948-.072 4.354-.198 6.782-2.626 6.98-6.98.058-1.28.072-1.689.072-4.948 0-3.258-.014-3.667-.072-4.947-.198-4.362-2.626-6.78-6.98-6.98C15.667.013 15.259 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4A6.2 6.2 0 0 0 12 5.8zm0 10.2a4 4 0 1 1 0-8.001 4 4 0 0 1 0 8zm6.4-11.845a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
              </svg>
              <span class="relative">
                Follow on Instagram
                <span class="absolute inset-x-0 -bottom-0.5 h-0.5 bg-pink-200 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </span>
            </a>
            
            <a href="https://www.tiktok.com/@perlaaccesories0?_t=ZS-8vtSpUwLtoO&_r=1" target="_blank" rel="noopener" 
               class="group inline-flex items-center px-6 py-3 bg-white text-gray-700 border-2 border-pink-200 rounded-xl font-medium hover:bg-pink-50 hover:border-pink-300 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-pink-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.37 6.37 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.95 4.37l.02.01v-9.1a8.32 8.32 0 0 0 5.62 2.19V9.68a4.85 4.85 0 0 1-2.83-.99"/>
              </svg>
              <span class="relative">
                Follow on TikTok
                <span class="absolute inset-x-0 -bottom-0.5 h-0.5 bg-pink-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </span>
            </a>
          </div>
        </div>
        
        <!-- Enhanced Back to Home Button -->
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
      
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    </style>
  `,
})
export class AboutComponent implements OnInit {
  private seo = inject(SeoService);

  ngOnInit(): void {
    // Set SEO data for about page
    this.seo.updateSEO(this.seo.generateAboutSEO());
    this.seo.updateCanonicalUrl('/about');

    // Add breadcrumb structured data
    const breadcrumbs = [
      { name: 'Home', url: '/' },
      { name: 'About', url: '/about' }
    ];
    const breadcrumbData = this.seo.generateBreadcrumbStructuredData(breadcrumbs);
    this.seo.updateSEO({ structuredData: breadcrumbData });
  }
}