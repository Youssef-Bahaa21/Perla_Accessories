import { Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api/api.service';
import { environment } from '../../../../environments/environment';

import { Order as BaseOrder, OrderItem } from '../../../core/models';

interface Order extends BaseOrder {
  user_id: number | null;
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
  items: OrderItem[];
  total: number;
  delivery_fee: number;
  payment_method?: 'cod' | 'vodafone_cash' | 'instapay';
}
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Chart } from 'chart.js';
import * as XLSX from 'xlsx';

interface FilterParams {
  dateRange: { start: Date | null; end: Date | null };
  status: string[];
  search: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss'],
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  loading = true;
  error = '';
  baseUrl = environment.api;
  fallbackImage = 'https://via.placeholder.com/150';
  chart: Chart | undefined;
  filterParams: FilterParams = {
    dateRange: { start: null, end: null },
    status: [],
    search: '',
    sortBy: 'created_at',
    sortDirection: 'desc'
  };
  selectedOrders: Set<number> = new Set();
  bulkActionStatus: string = '';
  // Selected order for modal view
  selectedOrder: Order | null = null;
  // Modal visibility
  showOrderModal = false;

  // Payment instructions details
  paymentDetails = {
    vodafone_cash: {
      phone: '01008914681',
      whatsapp: '01008914681'
    },
    instapay: {
      account: 'israabahaa0@instapay',
      link: 'https://ipn.eg/S/israabahaa0/instapay/5Pq7hm',
      whatsapp: '01008914681'
    }
  };

  get totalRevenue(): number {
    return this.filteredOrders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + this.getGrandTotal(order), 0);
  }

  get completedOrdersCount(): number {
    return this.filteredOrders.filter(order => order.status === 'completed').length;
  }

  get pendingOrdersCount(): number {
    return this.filteredOrders.filter(order => order.status === 'pending').length;
  }

  get averageOrderValue(): number {
    return this.totalRevenue / Math.max(1, this.filteredOrders.length);
  }

  private api = inject(ApiService);
  @ViewChild('pdfContent') pdfContentRef!: ElementRef;

  ngOnInit() {
    this.fetchOrders();
    this.initializeAnalytics();
  }

  fetchOrders() {
    this.loading = true;
    this.api.orders.list().subscribe({
      next: res => {
        this.orders = res.map((o: any) => ({
          ...o,
          delivery_fee: Number(o.delivery_fee) || 0,
          total: Number(o.total) || 0,
          items: o.items?.map((i: any) => {
            // Process product image URL properly
            let imageUrl = i.product_image || '';

            // Check if the image URL is already a full URL
            if (imageUrl.startsWith('http')) {
              // Use the full URL directly
              return {
                ...i,
                unit_price: Number(i.unit_price),
                quantity: Number(i.quantity),
                product_name: i.product_name,
                product_id: i.product_id,
                product_image: imageUrl,
              };
            } else {
              // Handle legacy local file paths
              let imagePath = imageUrl;
              if (imagePath.startsWith('/uploads/')) {
                // If it starts with /uploads/, remove that prefix
                imagePath = imagePath.replace('/uploads/', '');
              } else if (imagePath.startsWith('/')) {
                // Remove leading slash if present
                imagePath = imagePath.slice(1);
              }
              const finalUrl = imagePath ? `${this.baseUrl}uploads/${imagePath}` : this.fallbackImage;
              return {
                ...i,
                unit_price: Number(i.unit_price),
                quantity: Number(i.quantity),
                product_name: i.product_name,
                product_id: i.product_id,
                product_image: finalUrl,
              };
            }
          }) || [],
          status: o.status as 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled',
          payment_method: o.payment_method as 'cod' | 'vodafone_cash' | 'instapay'
        }));
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.error = '❌ Failed to load orders.';
        this.loading = false;
      },
    });
  }

  applyFilters() {
    let filtered = [...this.orders];

    // Apply date range filter
    if (this.filterParams.dateRange.start || this.filterParams.dateRange.end) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.created_at);
        const startDate = this.filterParams.dateRange.start ? new Date(this.filterParams.dateRange.start) : null;
        const endDate = this.filterParams.dateRange.end ? new Date(this.filterParams.dateRange.end) : null;

        return (!startDate || orderDate >= startDate) &&
          (!endDate || orderDate <= endDate);
      });
    }

    // Apply status filter
    if (this.filterParams.status.length > 0) {
      filtered = filtered.filter(order => this.filterParams.status.includes(order.status));
    }

    // Apply search filter
    if (this.filterParams.search) {
      const searchLower = this.filterParams.search.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toString().includes(searchLower) ||
        order.shipping_name?.toLowerCase().includes(searchLower) ||
        order.shipping_phone?.includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[this.filterParams.sortBy as keyof Order];
      const bValue = b[this.filterParams.sortBy as keyof Order];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return this.filterParams.sortDirection === 'asc' ?
          aValue.localeCompare(bValue) :
          bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return this.filterParams.sortDirection === 'asc' ?
          aValue - bValue :
          bValue - aValue;
      }
      return 0;
    });

    this.filteredOrders = filtered;
    this.updateAnalytics();
  }

  initializeAnalytics() {
    const ctx = document.getElementById('analyticsChart') as HTMLCanvasElement;
    if (ctx) {
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Revenue',
              data: [],
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  updateAnalytics() {
    if (!this.chart) return;

    // Calculate daily revenue
    const dailyRevenue = new Map<string, number>();
    this.filteredOrders.forEach(order => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      dailyRevenue.set(date, (dailyRevenue.get(date) || 0) + this.getGrandTotal(order));
    });

    // Update chart data
    this.chart.data.labels = Array.from(dailyRevenue.keys());
    this.chart.data.datasets[0].data = Array.from(dailyRevenue.values());
    this.chart.update();
  }

  updateStatus(orderId: number, status: string) {
    if (!status || !['pending', 'paid', 'shipped', 'completed', 'cancelled'].includes(status)) return;

    this.api.orders.update(orderId, { status }).subscribe({
      next: () => {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
          order.status = status as 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
          this.applyFilters();
        }
      },
      error: () => alert('❌ Failed to update status')
    });
  }

  archiveOrder(orderId: number) {
    if (!confirm('Archive this order?')) return;
    this.api.orders.delete(orderId).subscribe({
      next: () => this.orders = this.orders.filter(o => o.id !== orderId),
      error: () => alert('❌ Failed to archive'),
    });
  }

  getStatusClasses(status: string): string {
    const classes: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      paid: 'bg-blue-100 text-blue-700',
      shipped: 'bg-gray-100 text-gray-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return classes[status] || 'bg-gray-100 text-gray-700';
  }

  toggleStatusFilter(status: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      if (!this.filterParams.status.includes(status)) {
        this.filterParams.status.push(status);
      }
    } else {
      this.filterParams.status = this.filterParams.status.filter(s => s !== status);
    }
    this.applyFilters();
  }

  toggleSelectOrder(orderId: number) {
    if (this.selectedOrders.has(orderId)) {
      this.selectedOrders.delete(orderId);
    } else {
      this.selectedOrders.add(orderId);
    }
  }

  bulkUpdateStatus(status: string) {
    if (this.selectedOrders.size === 0) return;
    if (!status || !['pending', 'paid', 'shipped', 'completed', 'cancelled'].includes(status)) return;

    this.selectedOrders.forEach(orderId => {
      this.api.orders.update(orderId, { status }).subscribe({
        next: () => {
          const order = this.orders.find(o => o.id === orderId);
          if (order) {
            order.status = status as 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
            this.applyFilters();
          }
        },
        error: () => alert('❌ Failed to update status')
      });
    });
    this.selectedOrders.clear();
  }

  exportToExcel() {
    const data = this.filteredOrders.map((order: Order) => ({
      'Order ID': order.id,
      'Customer Name': order.shipping_name,
      'Total Amount': this.getGrandTotal(order),
      'Status': order.status,
      'Created At': new Date(order.created_at).toISOString(),
      'Items': order.items?.map(item => `${item.product_name} x ${item.quantity}`).join(', '),
      'Payment Method': this.getPaymentMethodLabel(order.payment_method)
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    XLSX.writeFile(wb, 'orders_export.xlsx');
  }

  getPaymentMethodLabel(method?: 'cod' | 'vodafone_cash' | 'instapay'): string {
    switch (method) {
      case 'cod': return 'Cash on Delivery';
      case 'vodafone_cash': return 'Vodafone Cash';
      case 'instapay': return 'InstaPay';
      default: return 'Unknown';
    }
  }

  getDeliveryFee(order: Order): number {
    return Number(order.delivery_fee) || 0;
  }

  getSubtotalBeforeDiscount(order: Order): number {
    return order.items?.reduce((sum, i) => sum + Number(i.unit_price) * i.quantity, 0) || 0;
  }

  getDiscount(order: Order): number {
    const subtotal = this.getSubtotalBeforeDiscount(order);
    return Math.max(0, subtotal - (order.total || 0));
  }

  getGrandTotal(order: Order): number {
    return (order.total || 0) + this.getDeliveryFee(order);
  }

  downloadInvoice(order: Order) {
    const itemsHtml = order.items?.map(i => `
      <tr>
        <td style="padding: 8px; display: flex; align-items: center; gap: 10px;">
          ${i.product_image
        ? `<img src="${i.product_image}" 
                     style="width:40px; height:40px; object-fit:cover; border-radius:5px;"
                     onerror="this.src='${this.fallbackImage}';"
                     crossOrigin="anonymous" />`
        : ''}
          <div>
            <div><strong>${i.product_name || 'Product #' + i.product_id}</strong></div>
            <div style="font-size: 11px; color: #888;">#${i.product_id}</div>
          </div>
        </td>
        <td style="text-align:center;">${i.quantity}</td>
        <td style="text-align:right;">EGP ${Number(i.unit_price).toFixed(2)}</td>
        <td style="text-align:right;">EGP ${(Number(i.unit_price) * i.quantity).toFixed(2)}</td>
      </tr>
    `).join('') || '';

    const discount = this.getDiscount(order);
    const html = `
      <div style="font-family: Arial; padding: 20px; width: 800px;">
        <h2 style="color:#e91e63">Invoice #${order.id}</h2>
        <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
        <p><strong>User ID:</strong> ${order.user_id}</p>
        <h3>Shipping Details</h3>
        <p><strong>Name:</strong> ${order.shipping_name}</p>
        <p><strong>Address:</strong> ${order.shipping_address}</p>
        <p><strong>City:</strong> ${order.shipping_city}</p>
        <p><strong>Phone:</strong> ${order.shipping_phone}</p>
  
        <h3>Items</h3>
        <table style="width:100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="text-align:left;">Product</th>
              <th style="text-align:center;">Qty</th>
              <th style="text-align:right;">Unit Price</th>
              <th style="text-align:right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
  
        <div style="text-align:right; margin-top:20px;">
          <p><strong>Subtotal:</strong> EGP ${this.getSubtotalBeforeDiscount(order).toFixed(2)}</p>
          ${order.coupon_code && discount > 0
        ? `<p><strong>Discount:</strong> -EGP ${discount.toFixed(2)}</p>` : ''}
          <p><strong>Delivery Fee:</strong> EGP ${order.delivery_fee.toFixed(2)}</p>
          <p style="font-weight:bold; color:#e91e63"><strong>Grand Total:</strong> EGP ${this.getGrandTotal(order).toFixed(2)}</p>
        </div>
      </div>
    `;

    const container = this.pdfContentRef.nativeElement as HTMLElement;
    container.innerHTML = html;

    html2canvas(container, {
      useCORS: true,
      allowTaint: false,
      logging: true,
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');
      const width = 595.28;
      const height = canvas.height * width / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`Invoice-${order.id}.pdf`);
    });
  }

  printInvoice(order: Order): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const orderDate = new Date(order.created_at).toLocaleDateString();

    let content = `
      <html>
      <head>
        <title>Invoice #${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .invoice-header { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .invoice-title { font-size: 24px; font-weight: bold; }
          .invoice-details { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f2f2f2; }
          .total-row { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <div class="invoice-title">INVOICE</div>
          <div>
            <div>Invoice #: ${order.id}</div>
            <div>Date: ${orderDate}</div>
          </div>
        </div>
        
        <div class="invoice-details">
          <div><strong>Bill To:</strong></div>
          <div>${order.shipping_name}</div>
          <div>${order.shipping_address}</div>
          <div>${order.shipping_city}</div>
          <div>Phone: ${order.shipping_phone}</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
    `;

    order.items.forEach(item => {
      const itemTotal = item.quantity * item.unit_price;
      content += `
        <tr>
          <td>
            ${item.product_image ? `<img src="${item.product_image}" style="width:40px; height:40px; object-fit:cover; border-radius:5px; margin-right:10px; display:inline-block; vertical-align:middle;" onerror="this.src='${this.fallbackImage}';" />` : ''}
            ${item.product_name}
          </td>
          <td>${item.quantity}</td>
          <td>EGP ${item.unit_price.toFixed(2)}</td>
          <td>EGP ${itemTotal.toFixed(2)}</td>
        </tr>
      `;
    });

    const subtotal = this.getSubtotalBeforeDiscount(order);
    const discount = this.getDiscount(order);
    const deliveryFee = this.getDeliveryFee(order);
    const grandTotal = this.getGrandTotal(order);

    content += `
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="text-align: right;"><strong>Subtotal:</strong></td>
              <td>EGP ${subtotal.toFixed(2)}</td>
            </tr>
    `;

    if (discount > 0) {
      content += `
        <tr>
          <td colspan="3" style="text-align: right;"><strong>Discount:</strong></td>
          <td>- EGP ${discount.toFixed(2)}</td>
        </tr>
      `;
    }

    content += `
            <tr>
              <td colspan="3" style="text-align: right;"><strong>Delivery Fee:</strong></td>
              <td>EGP ${deliveryFee.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3" style="text-align: right;"><strong>Grand Total:</strong></td>
              <td>EGP ${grandTotal.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        
        <div style="margin-top: 30px;">
          <p><strong>Payment Status:</strong> ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
          <p><strong>Payment Method:</strong> ${this.getPaymentMethodLabel(order.payment_method)}</p>
          <p><strong>Thank you for your business!</strong></p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
    }, 500);
  }

  renderAdvancedCharts(): void {
    console.log('Chart rendering disabled for performance');
  }

  applyAdvancedFilters(): void {
    this.applyFilters();
  }

  ngAfterViewInit(): void {
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = this.fallbackImage;
  }

  // Helper method for handling select change events
  onStatusChange(event: Event): string {
    return (event.target as HTMLSelectElement).value;
  }

  // Helper method for handling bulk status change
  onBulkStatusChange(event: Event): void {
    this.bulkActionStatus = this.onStatusChange(event);
  }

  // Helper method for handling order status change
  onOrderStatusChange(orderId: number, event: Event): void {
    const status = this.onStatusChange(event);
    if (status) {
      this.updateStatus(orderId, status);
    }
  }

  // Open modal with order details
  toggleOrderDetails(orderId: number): void {
    const order = this.filteredOrders.find(o => o.id === orderId);
    if (order) {
      this.openOrderModal(order);
    }
  }

  // Check if order details are expanded (for compatibility with existing code)
  isOrderExpanded(orderId: number): boolean {
    return this.selectedOrder?.id === orderId && this.showOrderModal;
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      // Select all filtered orders
      this.filteredOrders.forEach(order => {
        this.selectedOrders.add(order.id);
      });
    } else {
      // Deselect all orders
      this.selectedOrders.clear();
    }
  }

  toggleOrderSelection(orderId: number): void {
    if (this.selectedOrders.has(orderId)) {
      this.selectedOrders.delete(orderId);
    } else {
      this.selectedOrders.add(orderId);
    }
  }

  getSelectedOrdersTotal(): number {
    return this.filteredOrders
      .filter(order => this.selectedOrders.has(order.id))
      .reduce((sum, order) => sum + this.getGrandTotal(order), 0);
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'pending': 'bg-blue-100 text-blue-800',
      'paid': 'bg-purple-100 text-purple-800',
      'shipped': 'bg-amber-100 text-amber-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };

    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  resetFilters(): void {
    this.filterParams = {
      dateRange: { start: null, end: null },
      status: [],
      search: '',
      sortBy: 'created_at',
      sortDirection: 'desc'
    };
    this.applyFilters();
  }

  // Open order details modal
  openOrderModal(order: Order): void {
    this.selectedOrder = order;
    this.showOrderModal = true;
  }

  // Close order details modal
  closeOrderModal(): void {
    this.selectedOrder = null;
    this.showOrderModal = false;
  }
}
