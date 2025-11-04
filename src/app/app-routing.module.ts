import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderListComponent } from './orders/order-list/order-list.component';
import { OrderFormComponent } from './orders/order-form/order-form.component';

const routes: Routes = [
  { path: '', redirectTo: '/orders', pathMatch: 'full' }, // default route
  { path: 'orders', component: OrderListComponent },
  { path: 'orders/new', component: OrderFormComponent },
  { path: 'orders/:id/edit', component: OrderFormComponent },
  { path: '**', redirectTo: '/orders' } // fallback
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
