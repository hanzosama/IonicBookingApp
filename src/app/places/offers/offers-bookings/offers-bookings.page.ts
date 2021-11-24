import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Place } from '../../place.model';
import { PlacesService } from '../../places-service.service';

@Component({
  selector: 'app-offers-bookings',
  templateUrl: './offers-bookings.page.html',
  styleUrls: ['./offers-bookings.page.scss'],
})
export class OffersBookingsPage implements OnInit, OnDestroy {
  offer: Place;
  private placesSubject: Subscription;
  //Observable router
  constructor(
    private route: ActivatedRoute,
    private navController: NavController,
    private placesServices: PlacesService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap) => {
      if (!paramMap.has('offerId')) {
        this.navController.navigateBack('/places/tabs/offers');
        return;
      }

      this.placesServices
        .getPlaces(paramMap.get('offerId'))
        .subscribe((place) => {
          this.offer = place;
        });
    });
  }

  ngOnDestroy(): void {
    if (this.placesSubject) {
      this.placesSubject.unsubscribe();
    }
  }
}
