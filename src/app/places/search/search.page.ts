import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { SegmentChangeEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { Place } from '../place.model';
import { PlacesService } from '../places-service.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit, OnDestroy {
  loadedPlaces: Place[];
  listedLoadedPlaces: Place[];
  relevantPlaces: Place[];
  isLoading = false;
  private placesSubject: Subscription;
  private serviceSubject: Subscription;

  constructor(
    private placesServices: PlacesService,
    private menuCtr: MenuController,
    private authService: AuthenticationService
  ) {}

  ngOnInit() {
    this.placesSubject = this.placesServices.places.subscribe((places) => {
      this.loadedPlaces = places;
      this.relevantPlaces = this.loadedPlaces;
      this.listedLoadedPlaces = this.relevantPlaces.slice(1);
    });
  }

  ngOnDestroy() {
    if (this.placesSubject) {
      this.placesSubject.unsubscribe();
    }

    if (this.serviceSubject) {
      this.serviceSubject.unsubscribe();
    }
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.serviceSubject = this.placesServices.fetchPlaces().subscribe(() => {
      this.isLoading = false;
    });
  }

  //Burger menu programatically
  openSideMenu() {
    this.menuCtr.toggle();
  }

  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    this.authService.userId.pipe(take(1)).subscribe((userId) => {
      if (event.detail.value === 'all') {
        this.relevantPlaces = this.loadedPlaces;
        this.listedLoadedPlaces = this.relevantPlaces.slice(1);
      } else {
        this.relevantPlaces = this.loadedPlaces.filter(
          (place) => place.userId !== userId
        );
        this.listedLoadedPlaces = this.relevantPlaces.slice(1);
      }
    });
  }
}
