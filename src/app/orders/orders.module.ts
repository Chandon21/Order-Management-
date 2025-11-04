import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { OrderListComponent } from './order-list/order-list.component';
import { OrderFormComponent } from './order-form/order-form.component';

@NgModule({
  declarations: [
    OrderListComponent,
    OrderFormComponent
  ],
  imports: [
    CommonModule,        // Needed for *ngFor, pipes like date/currency
    ReactiveFormsModule, // Needed for [formGroup], FormArray
    FormsModule,         // Needed for [(ngModel)]
    RouterModule         // Needed for routerLink
  ],
  exports: [
    OrderListComponent,
    OrderFormComponent
  ]
})
export class OrdersModule { }
