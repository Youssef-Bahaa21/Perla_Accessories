import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService, ShippingCity } from '../../../../core/services/api/api.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-admin-settings',
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);

  form = this.fb.group({
    shipping_fee: [0, [Validators.required, Validators.min(0)]],
  });

  // ✅ Shipping Cities Management
  cityForm = this.fb.group({
    city_name: ['', [Validators.required, Validators.minLength(1)]],
    shipping_fee: [0, [Validators.required, Validators.min(0)]],
  });

  shippingCities: ShippingCity[] = [];
  editingCity: ShippingCity | null = null;
  isEditMode = false;

  loading = false;
  citiesLoading = false;
  success = '';
  error = '';
  citySuccess = '';
  cityError = '';

  ngOnInit() {
    this.loadShippingFee();
    this.loadShippingCities();
  }

  loadShippingFee() {
    this.loading = true;
    this.api.settings.getShippingFee().subscribe({
      next: resp => {
        this.form.patchValue({ shipping_fee: resp.shipping_fee });
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load current shipping fee.';
        this.loading = false;
      }
    });
  }

  loadShippingCities() {
    this.citiesLoading = true;
    this.api.settings.getShippingCities().subscribe({
      next: cities => {
        this.shippingCities = cities;
        this.citiesLoading = false;
      },
      error: () => {
        this.cityError = 'Failed to load shipping cities.';
        this.citiesLoading = false;
      }
    });
  }

  save() {
    if (this.form.invalid) return;
    this.loading = true;
    this.success = this.error = '';
    const fee = this.form.value.shipping_fee!;
    this.api.settings.updateShippingFee(fee).subscribe({
      next: () => {
        this.success = 'Shipping fee updated successfully!';
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to update shipping fee.';
        this.loading = false;
      }
    });
  }

  // ✅ Shipping Cities Methods
  addCity() {
    if (this.cityForm.invalid) return;

    this.citiesLoading = true;
    this.citySuccess = this.cityError = '';

    const { city_name, shipping_fee } = this.cityForm.value;

    this.api.settings.createShippingCity(city_name!, shipping_fee!).subscribe({
      next: (newCity) => {
        this.shippingCities.push(newCity);
        this.cityForm.reset();
        this.citySuccess = 'City added successfully!';
        this.citiesLoading = false;
      },
      error: (err) => {
        this.cityError = err?.error?.error || 'Failed to add city.';
        this.citiesLoading = false;
      }
    });
  }

  editCity(city: ShippingCity) {
    this.editingCity = city;
    this.isEditMode = true;
    this.cityForm.patchValue({
      city_name: city.city_name,
      shipping_fee: city.shipping_fee
    });
    this.citySuccess = this.cityError = '';
  }

  updateCity() {
    if (this.cityForm.invalid || !this.editingCity) return;

    this.citiesLoading = true;
    this.citySuccess = this.cityError = '';

    const { city_name, shipping_fee } = this.cityForm.value;

    this.api.settings.updateShippingCity(
      this.editingCity.id,
      city_name!,
      shipping_fee!,
      this.editingCity.is_active
    ).subscribe({
      next: () => {
        // Update local array
        const index = this.shippingCities.findIndex(c => c.id === this.editingCity!.id);
        if (index !== -1) {
          this.shippingCities[index] = {
            ...this.editingCity!,
            city_name: city_name!,
            shipping_fee: shipping_fee!,
            updated_at: new Date().toISOString()
          };
        }

        this.cancelEdit();
        this.citySuccess = 'City updated successfully!';
        this.citiesLoading = false;
      },
      error: (err) => {
        this.cityError = err?.error?.error || 'Failed to update city.';
        this.citiesLoading = false;
      }
    });
  }

  deleteCity(city: ShippingCity) {
    if (!confirm(`Are you sure you want to delete "${city.city_name}"?`)) return;

    this.citiesLoading = true;
    this.citySuccess = this.cityError = '';

    this.api.settings.deleteShippingCity(city.id).subscribe({
      next: () => {
        this.shippingCities = this.shippingCities.filter(c => c.id !== city.id);
        this.citySuccess = 'City deleted successfully!';
        this.citiesLoading = false;
      },
      error: (err) => {
        this.cityError = err?.error?.error || 'Failed to delete city.';
        this.citiesLoading = false;
      }
    });
  }

  toggleCityStatus(city: ShippingCity) {
    this.citiesLoading = true;
    this.citySuccess = this.cityError = '';

    this.api.settings.toggleShippingCityStatus(city.id).subscribe({
      next: () => {
        // Update local array
        const index = this.shippingCities.findIndex(c => c.id === city.id);
        if (index !== -1) {
          this.shippingCities[index].is_active = !this.shippingCities[index].is_active;
        }

        const status = city.is_active ? 'disabled' : 'enabled';
        this.citySuccess = `City ${status} successfully!`;
        this.citiesLoading = false;
      },
      error: (err) => {
        this.cityError = err?.error?.error || 'Failed to update city status.';
        this.citiesLoading = false;
      }
    });
  }

  cancelEdit() {
    this.editingCity = null;
    this.isEditMode = false;
    this.cityForm.reset();
    this.citySuccess = this.cityError = '';
  }
}
