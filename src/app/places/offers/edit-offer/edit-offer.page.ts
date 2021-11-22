import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Offer } from '../offers-model';
import { OffersService } from '../offers.service';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit {

  offerEdited: Offer;

  constructor(private offersService: OffersService, private route: ActivatedRoute, private navController: NavController) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('offerId')) {
        this.navController.navigateBack('/places/tabs/offers');
        return;
      }

      this.offerEdited = this.offersService.getOffer(paramMap.get('offerId'));

    });
  }

}
