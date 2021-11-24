import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActionSheetController, ModalController, NavController } from '@ionic/angular';
import { CreateBookingComponent } from '../../../bookings/create-booking/create-booking.component';
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
  constructor(private navController: NavController,
    private route: ActivatedRoute,
    private placesService: PlacesService,
    private modalCtr: ModalController,
    private actionSheetCtr: ActionSheetController
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      if (!params.has('placeId')) {
        this.navController.navigateBack('/places/tabs/search');
      }
      this.loadedPlace = this.placesService.getPlaces(params.get('placeId'));
    });
  }

  onBookPlace() {

    this.actionSheetCtr.create({
      header: 'Choose an action', buttons: [{
        text: 'Select Date',
        handler: () => {
          this.openBookingModal('select');
        }
      }, {
        text: 'Random Date',
        handler: () => {
          this.openBookingModal('random');
        }
      }, {
        text: 'Cancel',
        role: 'cancel'
      }]
    }).then(actionSheetEl => {
      actionSheetEl.present();
    });


  }

  openBookingModal(mode: 'select' | 'random') {
    console.log(mode);

    this.modalCtr.create({ component: CreateBookingComponent, componentProps: { selectedPlace: this.loadedPlace , selectedMode: mode} })
      .then(modalElm => {
        modalElm.present();
        //This could be chained to the before then using return statement
        modalElm.onDidDismiss().then(resultData => {
          console.log(resultData);
          if (resultData.role != null && resultData.role === 'confirm') {
            console.log('Booked!');
          }
        });
      });
  }

}
