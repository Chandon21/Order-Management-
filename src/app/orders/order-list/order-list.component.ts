import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { OrderService } from '../order.service';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
  public orders: any[] = [];
  public filteredOrders: any[] = [];
  public displayedOrders: any[] = [];
  public searchTerm: string = '';

  public filterStatus: string = '';
  public filterFrom: string = '';
  public filterTo: string = '';

  public sortBy: string = 'orderDate';
  public sortDir: 'asc' | 'desc' = 'desc';

  // ---------- Pagination ----------
  public currentPage: number = 1;
  public pageSize: number = 5; // orders per page
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
      this.sortBy = q.get('sortBy') || this.sortBy;
      this.sortDir = (q.get('sortDir') as 'asc'|'desc') || this.sortDir;
      this.currentPage = +(q.get('page') || 1);
      this.pageSize = +(q.get('pageSize') || 5);
      this.loadOrders();
    });
  }

  loadOrders() {
    this.orderService.getOrders().subscribe((res: any[]) => {
      this.orders = res || [];
      this.applyFilters();
    });
  }

  applyFilters() {
    const term = (this.searchTerm || '').toLowerCase().trim();

    this.filteredOrders = this.orders.filter(order => {
      const matchesSearch = !term || (
        (order.orderNo || '').toLowerCase().includes(term) ||
        (order.customer?.name || '').toLowerCase().includes(term) ||
        (order.status || '').toLowerCase().includes(term)
      );

      const matchesStatus = !this.filterStatus || order.status === this.filterStatus;

      let matchesFrom = true;
      let matchesTo = true;
      if (this.filterFrom) {
        matchesFrom = new Date(order.orderDate) >= new Date(this.filterFrom);
      }
      if (this.filterTo) {
        matchesTo = new Date(order.orderDate) <= new Date(this.filterTo);
      }

      return matchesSearch && matchesStatus && matchesFrom && matchesTo;
    });

    this.applySort();
    this.updateQueryParams();
  }

  applySort() {
    const arr = [...this.filteredOrders];

    const getValue = (order: any, field: string) => {
      if (!order) return null;
      if (field === 'customer') return (order.customer?.name || '').toLowerCase();
      if (field === 'orderDate') return new Date(order.orderDate).getTime();
      if (field === 'total') return Number(order.total || 0);
      return (order[field] || '').toString().toLowerCase();
    };

    arr.sort((a,b) => {
      const va = getValue(a,this.sortBy);
      const vb = getValue(b,this.sortBy);
      if(va==null && vb==null) return 0;
      if(va==null) return this.sortDir==='asc'? -1:1;
      if(vb==null) return this.sortDir==='asc'? 1:-1;
      if(va<vb) return this.sortDir==='asc'? -1:1;
      if(va>vb) return this.sortDir==='asc'? 1:-1;
      return 0;
    });

    // ---------- Apply Pagination ----------
    this.totalPages = Math.ceil(arr.length / this.pageSize);
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedOrders = arr.slice(start, end);
  }

  setSort(field: string) {
    if (this.sortBy === field) this.sortDir = this.sortDir==='asc'?'desc':'asc';
    else { this.sortBy = field; this.sortDir='asc'; }
    this.applySort();
    this.updateQueryParams();
  }

  clearFilters() {
    this.searchTerm = '';
    this.filterStatus = '';
    this.filterFrom = '';
    this.filterTo = '';
    this.currentPage = 1; // reset to first page
    this.applyFilters();
  }

  updateQueryParams() {
    const q: any = {};
    //filter
    if (this.searchTerm) q.search = this.searchTerm;
    if (this.filterStatus) q.status = this.filterStatus;
    if (this.filterFrom) q.from = this.filterFrom;
    if (this.filterTo) q.to = this.filterTo;
    //Sorting
    if (this.sortBy) q.sortBy = this.sortBy;
    if (this.sortDir) q.sortDir = this.sortDir;
    //pagination add for page
    q.page = this.currentPage;
  q.pageSize = this.pageSize;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: q,
      replaceUrl: true
    });
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.applySort(); // re-apply sort to recalc displayedOrders for the new page
    this.updateQueryParams();
  }

  // ---------- Navigation / Actions ----------
  createOrder() {
    this.router.navigate(['/orders/new']);
  }

  editOrder(id: any) {
    this.router.navigate(['/orders', id, 'edit']);
  }

  deleteOrder(id: any) {
    if(!confirm('Are you sure you want to delete this order?')) return;
    this.orderService.deleteOrder(id).subscribe(()=> this.loadOrders());
  }
}
