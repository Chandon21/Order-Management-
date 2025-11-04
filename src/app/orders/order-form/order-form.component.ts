import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { OrderService } from '../order.service';
import { CustomerService } from '../customer.service';

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.css']
})
export class OrderFormComponent implements OnInit {
  public orderForm!: FormGroup;
  public customers: any[] = [];
  public products = [
    { name: 'Laptop', price: 800 },
    { name: 'Mouse', price: 50 },
    { name: 'Keyboard', price: 100 },
    { name: 'Monitor', price: 300 },
    { name: 'Printer', price: 150 },
    { name: 'Headset', price: 70 },
    { name: 'Webcam', price: 90 },
    { name: 'Speaker', price: 60 }
  ];
  public orderId: number | null = null;
  public newCustomerName: string = '';

  constructor(
    private fb: FormBuilder,
    public router: Router,
    private route: ActivatedRoute,
    private orderService: OrderService,
    private customerService: CustomerService
  ) {}

  ngOnInit(): void {
    this.orderId = Number(this.route.snapshot.paramMap.get('id'));
    this.orderForm = this.fb.group({
      orderNo: [{ value: '', disabled: true }],
      orderDate: [new Date().toISOString().substring(0, 10), Validators.required],
      customer: ['', Validators.required],
      status: ['Pending', Validators.required],
      items: this.fb.array([]),
      vat: [0],
      discount: [0],
      total: [{ value: 0, disabled: true }]
    });

    // Load customers
    this.customerService.getCustomers().subscribe(res => this.customers = res);

    // Load order if editing
    if (this.orderId) {
      this.orderService.getOrder(this.orderId).subscribe(order => {
        this.orderForm.patchValue({
          orderNo: order.orderNo,
          orderDate: order.orderDate,
          customer: order.customer?.id,
          status: order.status,
          vat: order.vat || 0,
          discount: order.discount || 0
        });
        order.items.forEach((item: any) => this.addItem(item));
        this.calculateTotal();
      });
    } else {
      this.generateOrderNo();
      this.addItem(); // start with one item
    }
  }

  get items(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  addItem(item?: any) {
    this.items.push(this.fb.group({
      product: [item?.product || '', Validators.required],
      qty: [item?.qty || 1, [Validators.required, Validators.min(1)]],
      price: [item?.price || 0, Validators.required],
      total: [{ value: item?.total || 0, disabled: true }]
    }));
  }

  removeItem(index: number) {
    this.items.removeAt(index);
    this.calculateTotal();
  }

  calculateTotal() {
    let subtotal = 0;
    this.items.controls.forEach(group => {
      const qty = group.get('qty')?.value || 0;
      const price = group.get('price')?.value || 0;
      const total = qty * price;
      group.get('total')?.setValue(total);
      subtotal += total;
    });

    const vat = this.orderForm.get('vat')?.value || 0;
    const discount = this.orderForm.get('discount')?.value || 0;
    const grandTotal = subtotal + subtotal * (vat / 100) - subtotal * (discount / 100);
    this.orderForm.get('total')?.setValue(grandTotal);
  }

  save() {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    const orderData = this.orderForm.getRawValue();
    const customerId = orderData.customer;
    const customerObj = this.customers.find(c => c.id === customerId);
    orderData.customer = customerObj;

    if (this.orderId) {
      this.orderService.updateOrder(this.orderId, orderData).subscribe(() => {
        this.router.navigate(['/orders']);
      });
    } else {
      this.orderService.createOrder(orderData).subscribe(() => {
        this.router.navigate(['/orders']);
      });
    }
  }

  // Add new customer from input
  addNewCustomer() {
    if (!this.newCustomerName.trim()) return;
    const newCustomer = { name: this.newCustomerName };
    this.customerService.createCustomer(newCustomer).subscribe(res => {
      this.customers.push(res);
      this.orderForm.get('customer')?.setValue(res.id);
      this.newCustomerName = '';
    });
  }

  // Optional: Guest customer
  addGuestCustomer() {
    const guestCustomer = { name: 'Guest Customer' };
    this.customerService.createCustomer(guestCustomer).subscribe(res => {
      this.customers.push(res);
      this.orderForm.get('customer')?.setValue(res.id);
    });
  }

  generateOrderNo() {
    const year = new Date().getFullYear();
    const randomNumber = Math.floor(100 + Math.random() * 900); // 3 digits
    this.orderForm.get('orderNo')?.setValue(`SO-${year}-${randomNumber}`);
  }
}
