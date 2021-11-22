import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OffersBookingsPageRoutingModule } from './offers-bookings-routing.module';

import { OffersBookingsPage } from './offers-bookings.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OffersBookingsPageRoutingModule
  ],
  declarations: [OffersBookingsPage]
})
export class OffersBookingsPageModule {}
