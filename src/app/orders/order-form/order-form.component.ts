import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../order.service';
import { CustomerService } from '../customer.service';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.css']
})
export class OrderFormComponent implements OnInit {
  orderForm: FormGroup;
  customers: any[] = [];
  products: any[] = [];
  orderId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private customerService: CustomerService,
    private productService: ProductService,
    public router: Router,
    public route: ActivatedRoute
  ) {
    // Initialize Form
    this.orderForm = this.fb.group({
      customer: [null, Validators.required],
      items: this.fb.array([]),
      vat: [0],
      discount: [0],
      total: [{ value: 0, disabled: true }]
    });
  }

  ngOnInit(): void {
    // Load customers and products
    this.customerService.getCustomers().subscribe(res => this.customers = res);
    this.productService.getProducts().subscribe(res => this.products = res);

    // Check if Edit mode
    this.orderId = this.route.snapshot.paramMap.get('id');
    if (this.orderId) {
      this.orderService.getOrder(+this.orderId).subscribe(order => {
        this.orderForm.patchValue({
          customer: order.customer,
          vat: order.vat || 0,
          discount: order.discount || 0
        });
        order.items.forEach((item: any) => this.addItem(item));

        this.calculateTotal();
      });
    } else {
      this.addItem(); // At least one item for new order
    }
  }

  get items(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  addItem(item?: any) {
    this.items.push(this.fb.group({
      product: [item?.product || null, Validators.required],
      qty: [item?.qty || 1, [Validators.required, Validators.min(1)]],
      price: [item?.price || 0, [Validators.required, Validators.min(0)]],
      total: [{ value: item?.total || 0, disabled: true }]
    }));
    this.calculateTotal();
  }

  removeItem(index: number) {
    this.items.removeAt(index);
    this.calculateTotal();
  }

  calculateTotal() {
    let total = 0;
    this.items.controls.forEach(ctrl => {
      const qty = ctrl.get('qty')?.value || 0;
      const price = ctrl.get('price')?.value || 0;
      const lineTotal = qty * price;
      ctrl.get('total')?.setValue(lineTotal, { emitEvent: false });
      total += lineTotal;
    });

    const vat = this.orderForm.get('vat')?.value || 0;
    const discount = this.orderForm.get('discount')?.value || 0;
    const grandTotal = total + (total * vat / 100) - (total * discount / 100);
    this.orderForm.get('total')?.setValue(grandTotal);
  }

  save() {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    const orderData = this.orderForm.getRawValue();
    console.log('Order Data:', orderData);

    if (this.orderId) {
      this.orderService.updateOrder(+this.orderId, orderData).subscribe(() => {
        alert('Order updated successfully!');
        this.router.navigate(['/orders']);
      });
    } else {
      this.orderService.createOrder(orderData).subscribe(() => {
        alert('Order created successfully!');
        this.router.navigate(['/orders']);
      });
    }
  }
}
