import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Offer } from '../offers-model';
import { OffersService } from '../offers.service';

@Component({
  selector: 'app-offers-bookings',
  templateUrl: './offers-bookings.page.html',
  styleUrls: ['./offers-bookings.page.scss'],
})
export class OffersBookingsPage implements OnInit {
  offer: Offer;
  //Observable router
  constructor(private route: ActivatedRoute, private navController: NavController, private offersService: OffersService) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('offerId')) {
        this.navController.navigateBack('/places/tabs/offers');
        return;
      }

      this.offer = this.offersService.getOffer(paramMap.get('offerId'));

    });
  }

}
