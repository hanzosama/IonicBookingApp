import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Place } from '../place.model';
import { PlacesService } from '../places-service.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {
  loadedPlaces: Place[];
  listedLoadedPlaces: Place[];
  constructor(private placesServices: PlacesService, private menuCtr: MenuController) { }

  ngOnInit() {
    this.loadedPlaces = this.placesServices.places;
    this.listedLoadedPlaces = this.loadedPlaces.slice(1);
  }

  //Burger menu programatically
  openSideMenu() {
    this.menuCtr.toggle();
  }

}
