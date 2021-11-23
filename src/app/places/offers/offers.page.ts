import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonItemSliding } from '@ionic/angular';
import { Offer } from './offers-model';
import { OffersService } from './offers.service';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit {

  loadedOffers: Offer[];
  constructor(private offersService: OffersService, private router: Router) { }

  ngOnInit() {
    this.loadedOffers = this.offersService.offers;
  }


  onEdit(offerId: string, sliddingItem: IonItemSliding) {
    sliddingItem.close();

    this.router.navigate(['/', 'places', 'tabs', 'offers', 'edit', offerId]);

  }

}
