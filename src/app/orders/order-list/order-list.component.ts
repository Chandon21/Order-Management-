import { Component, OnInit } from '@angular/core';
import { OrderService } from '../order.service';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
  orders: any[] = [];
  searchTerm: string = '';
  page: number = 1;
  pageSize: number = 10;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    const params = {
      _page: this.page.toString(),
      _limit: this.pageSize.toString(),
      q: this.searchTerm
    };
    this.orderService.getOrders(params).subscribe((res: any) => {
      this.orders = res;
    });
  }

  onSearch(value: string): void {
    this.searchTerm = value;
    this.page = 1;
    this.loadOrders();
  }
}
