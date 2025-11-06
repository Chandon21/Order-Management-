import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { OrderService } from '../order.service';
import { CustomerService } from '../customer.service';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.css']
})
export class OrderFormComponent implements OnInit {
  public orderForm!: FormGroup;
  public customers: any[] = [];
  public products: any[] = [];
  public orderId: string | null = null;
  public isEditMode: boolean = false;
  public newCustomerName: string = '';

  constructor(
    private fb: FormBuilder,
    public router: Router,
    private route: ActivatedRoute,
    private orderService: OrderService,
    private customerService: CustomerService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    const orderIdParam = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!orderIdParam && orderIdParam !== 'new';
    this.orderId = this.isEditMode ? orderIdParam : null;

    // Initialize form
    this.orderForm = this.fb.group({
      orderNo: [''],
      orderDate: ['', Validators.required],
      customer: ['', Validators.required],
      status: ['Pending', Validators.required],
      items: this.fb.array([]),
      vat: [0, [Validators.min(0)]],
      discount: [0, [Validators.min(0)]],
      total: [{ value: 0, disabled: true }]
    });

    // Fetch customers
    this.customerService.getCustomers().subscribe(customers => {
      this.customers = customers.map(c => ({ ...c, id: String(c.id) }));
      this.initOrder();
    });

    // Fetch products
    this.productService.getProducts().subscribe(products => {
      this.products = products;
    });
  }

  get items(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  initOrder() {
    if (this.isEditMode && this.orderId !== null) {
      this.orderService.getOrder(this.orderId).subscribe(order => {
        const customerId = String(order.customer?.id);
        const customerExists = this.customers.some(c => c.id === customerId);
        if (!customerExists && order.customer?.name) {
          this.customers.push({ id: customerId, name: order.customer.name });
        }

        this.orderForm.patchValue({
          orderNo: order.orderNo,
          orderDate: order.orderDate,
          customer: customerId,
          status: order.status,
          vat: order.vat || 0,
          discount: order.discount || 0
        });

        const validProductNames = this.products.map(p => p.name);
        order.items.forEach((item: any) => {
          if (!validProductNames.includes(item.product)) {
            this.products.push({ name: item.product, price: item.price || 0 });
          }
          this.addItem(item);
        });

        this.calculateTotal();
      });
    } else {
      this.generateOrderNo();
      this.orderForm.get('orderDate')?.setValue(new Date().toISOString().substring(0, 10));
      this.addItem();
    }
  }

  addItem(item?: any) {
    this.items.push(this.fb.group({
      product: [item?.product || '', Validators.required],
      qty: [item?.qty || 1, [Validators.required, Validators.min(1)]],
      price: [item?.price || 0, [Validators.required, Validators.min(0)]],
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

    if (this.isEditMode && this.orderId !== null) {
      this.orderService.updateOrder(this.orderId, orderData).subscribe(() => {
        this.router.navigate(['/orders']);
      });
    } else {
      this.orderService.createOrder(orderData).subscribe(() => {
        this.router.navigate(['/orders']);
      });
    }
  }

  addNewCustomer() {
    if (!this.newCustomerName.trim()) return;
    const newCustomer = { name: this.newCustomerName };
    this.customerService.createCustomer(newCustomer).subscribe(res => {
      this.customers.push({ ...res, id: String(res.id) });
      this.orderForm.get('customer')?.setValue(res.id);
      this.newCustomerName = '';
    });
  }

  addGuestCustomer() {
    const guestCustomer = { name: 'Guest Customer' };
    this.customerService.createCustomer(guestCustomer).subscribe(res => {
      this.customers.push({ ...res, id: String(res.id) });
      this.orderForm.get('customer')?.setValue(res.id);
    });
  }

  generateOrderNo() {
    const year = new Date().getFullYear();
    const randomNumber = Math.floor(100 + Math.random() * 900);
    this.orderForm.get('orderNo')?.setValue(`SO-${year}-${randomNumber}`);
  }
}
