import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonItemSliding } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Place } from '../place.model';
import { PlacesService } from '../places-service.service';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit, OnDestroy {
  loadedOffers: Place[];
  private placesSubject: Subscription;
  constructor(private placesService: PlacesService, private router: Router) {}

  ngOnInit() {
    this.placesSubject = this.placesService.places.subscribe((places) => {
      this.loadedOffers = places;
    });
  }

  ngOnDestroy() {
    this.placesSubject.unsubscribe();
  }

  onEdit(offerId: string, sliddingItem: IonItemSliding) {
    sliddingItem.close();

    this.router.navigate(['/', 'places', 'tabs', 'offers', 'edit', offerId]);
  }
}
