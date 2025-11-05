import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../order.service';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
  public orders: any[] = [];
  public filteredOrders: any[] = [];
  public searchTerm: string = '';

  constructor(private orderService: OrderService, public router: Router) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getOrders().subscribe((res: any[]) => {
      this.orders = res;
      this.filteredOrders = [...this.orders];
    });
  }

  filterOrders() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredOrders = [...this.orders];
      return;
    }

    this.filteredOrders = this.orders.filter(order =>
      order.orderNo?.toLowerCase().includes(term) ||
      order.customer?.name?.toLowerCase().includes(term) ||
      order.status?.toLowerCase().includes(term)
    );
  }

  onSearchInput() {
    this.filterOrders();
  }

  createOrder() {
    this.router.navigate(['/orders/new']);
  }

  editOrder(id: number) {
    this.router.navigate(['/orders', id, 'edit']);
  }

  deleteOrder(id: number) {
    if (confirm('Are you sure you want to delete this order?')) {
      this.orderService.deleteOrder(id).subscribe(() => {
        this.loadOrders();
      });
    }
  }
}
