export interface Customer {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
}



export interface OrderItem {
  product: string;
  qty: number;
  price: number;
  total: number;
}

export interface Order {
  id?: string;
  orderNo: string;
  orderDate: string;
  customer: Customer;
  status: 'Pending' | 'Completed' | 'Cancelled';
  items: OrderItem[];
  vat: number;
  discount: number;
  total: number;
}
