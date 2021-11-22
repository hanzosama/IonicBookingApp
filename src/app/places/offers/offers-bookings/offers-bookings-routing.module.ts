import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OffersBookingsPage } from './offers-bookings.page';

const routes: Routes = [
  {
    path: '',
    component: OffersBookingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OffersBookingsPageRoutingModule {}
