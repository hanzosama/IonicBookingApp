import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Place } from '../../place.model';
import { PlacesService } from '../../places-service.service';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit {
  loadedPlace: Place;
  //Injecting Navigation Controller of Angular
  constructor(private navController: NavController, private route: ActivatedRoute, private placesService: PlacesService) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      if (!params.has('placeId')) {
        this.navController.navigateBack('/places/tabs/search');
      }
      this.loadedPlace = this.placesService.getPlaces(params.get('placeId'));
    });
  }

  onBookPlace() {

    this.navController.navigateBack('/places/tabs/search');
    // this used the stack to know where to go
    //this.navController.pop();
  }

}
