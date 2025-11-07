import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { OrderService } from '../order.service';
import { Order, Customer, OrderItem } from '../../models/order.model';
import { Params } from '@angular/router';
import { OrderQueryParams } from '../../models/queryparams.model';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
  public orders: Order[] = [];
  public filteredOrders: Order[] = [];
  public displayedOrders: Order[] = [];
  public searchTerm: string = '';

  public filterStatus: string = '';
  public filterFrom: string = '';
  public filterTo: string = '';

  public sortBy: keyof Order = 'orderDate';
  public sortDir: 'asc' | 'desc' = 'desc';

  public currentPage: number = 1;
  public pageSize: number = 10;
  public totalPages: number = 1;

  constructor(
    private orderService: OrderService,
    public router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(q => {
      this.searchTerm = q.get('search') || '';
      this.filterStatus = q.get('status') || '';
      this.filterFrom = q.get('from') || '';
      this.filterTo = q.get('to') || '';
      this.sortBy = (q.get('sortBy') as keyof Order) || this.sortBy;
      this.sortDir = (q.get('sortDir') as 'asc'|'desc') || this.sortDir;
      this.currentPage = +(q.get('page') || 1);
      this.pageSize = +(q.get('pageSize') || 10);
      this.loadOrders();
    });
  }
updateQueryParams() {
  const queryParams: OrderQueryParams = {
    search: this.searchTerm || undefined,
    status: this.filterStatus || undefined,
    from: this.filterFrom || undefined,
    to: this.filterTo || undefined,
    sortBy: this.sortBy?.toString(),
    sortDir: this.sortDir,
    page: this.currentPage,
    pageSize: this.pageSize
  };

 
  this.router.navigate([], {
    relativeTo: this.route,
    queryParams: queryParams as Params,
    replaceUrl: true
  });
}



  loadOrders(): void {
    this.orderService.getOrders().subscribe((res: Order[]) => {
      this.orders = res || [];
      this.applyFilters();
    });
  }

  applyFilters(): void {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredOrders = this.orders.filter(order => {
      const matchesSearch =
        !term ||
        order.orderNo.toLowerCase().includes(term) ||
        order.customer?.name.toLowerCase().includes(term) ||
        order.status.toLowerCase().includes(term);

      const matchesStatus = !this.filterStatus || order.status === this.filterStatus;

      const matchesFrom = !this.filterFrom || new Date(order.orderDate) >= new Date(this.filterFrom);
      const matchesTo = !this.filterTo || new Date(order.orderDate) <= new Date(this.filterTo);

      return matchesSearch && matchesStatus && matchesFrom && matchesTo;
    });

    this.applySort();
  }

  applySort(): void {
    const arr = [...this.filteredOrders];

    arr.sort((a: Order, b: Order) => {
      let valA: string | number;
let valB: string | number;

if (this.sortBy === 'customer') {
  valA = a.customer?.name.toLowerCase() || '';
  valB = b.customer?.name.toLowerCase() || '';
} else if (this.sortBy === 'orderDate') {
  valA = new Date(a.orderDate).getTime();
  valB = new Date(b.orderDate).getTime();
} else if (this.sortBy === 'total') {
  valA = a.total || 0;
  valB = b.total || 0;
} else {
  valA = String(a[this.sortBy] ?? '').toLowerCase();
  valB = String(b[this.sortBy] ?? '').toLowerCase();
}

      if (valA < valB) return this.sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    this.totalPages = Math.ceil(arr.length / this.pageSize);
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedOrders = arr.slice(start, end);
  }

  changePage(page: number) {
  if (page < 1 || page > this.totalPages) return;
  this.currentPage = page;
  this.applySort();
  this.updateQueryParams();
}

setSort(field: keyof Order) {
  if (this.sortBy === field) this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
  else this.sortBy = field;

  this.applySort();
  this.updateQueryParams();
}


  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.applySort();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterStatus = '';
    this.filterFrom = '';
    this.filterTo = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  createOrder(): void {
    this.router.navigate(['/orders/new']);
  }

  editOrder(id: string | undefined): void {
    if (!id) return;
    this.router.navigate(['/orders', id, 'edit']);
  }

  deleteOrder(id: string | undefined): void {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this order?')) return;
    this.orderService.deleteOrder(id).subscribe(() => this.loadOrders());
  }

  onSearchChange() {
  this.currentPage = 1; 
  this.applyFilters();
  this.updateQueryParams();
}

onStatusChange() {
  this.currentPage = 1;
  this.applyFilters();
  this.updateQueryParams();
}

onDateChange() {
  this.currentPage = 1;
  this.applyFilters();
  this.updateQueryParams();
}

}
