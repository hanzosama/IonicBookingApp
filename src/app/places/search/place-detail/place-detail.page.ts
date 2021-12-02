import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ActionSheetController,
  AlertController,
  LoadingController,
  ModalController,
  NavController,
} from '@ionic/angular';
import { Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { BookingService } from 'src/app/bookings/booking.service';
import { MapModalComponent } from 'src/app/shared/pickers/map-modal/map-modal.component';
import { CreateBookingComponent } from '../../../bookings/create-booking/create-booking.component';
import { Place } from '../../place.model';
import { PlacesService } from '../../places-service.service';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  loadedPlace: Place;
  isBookable = false;
  isLoading = false;
  private placesSubject: Subscription;
  //Injecting Navigation Controller of Angular
  constructor(
    private navController: NavController,
    private route: ActivatedRoute,
    private placesService: PlacesService,
    private modalCtr: ModalController,
    private actionSheetCtr: ActionSheetController,
    private bookingService: BookingService,
    private loadingCtr: LoadingController,
    private authService: AuthenticationService,
    private alertCtr: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      if (!params.has('placeId')) {
        this.navController.navigateBack('/places/tabs/search');
      }
      this.isLoading = true;
      let fetchUserId: string;
      this.placesSubject = this.authService.userId
        .pipe(
          take(1),
          switchMap((userId) => {
            if (!userId) {
              throw new Error('User not found');
            }
            fetchUserId = userId;
            return this.placesService.getPlaces(params.get('placeId'));
          })
        )
        .subscribe(
          (place) => {
            this.loadedPlace = place;
            this.isBookable = place.userId !== fetchUserId;
            this.isLoading = false;
          },
          (error) => {
            this.alertCtr
              .create({
                header: 'An error ocurr',
                message: 'Could not load place',
                buttons: [
                  {
                    text: 'Ok',
                    handler: () =>
                      this.router.navigate(['/places/tabs/search']),
                  },
                ],
              })
              .then((alertEl) => alertEl.present());
          }
        );
    });
  }

  ngOnDestroy(): void {
    if (this.placesSubject) {
      this.placesSubject.unsubscribe();
    }
  }

  onBookPlace() {
    this.actionSheetCtr
      .create({
        header: 'Choose an action',
        buttons: [
          {
            text: 'Select Date',
            handler: () => {
              this.openBookingModal('select');
            },
          },
          {
            text: 'Random Date',
            handler: () => {
              this.openBookingModal('random');
            },
          },
          {
            text: 'Cancel',
            role: 'cancel',
          },
        ],
      })
      .then((actionSheetEl) => {
        actionSheetEl.present();
      });
  }

  openBookingModal(mode: 'select' | 'random') {
    console.log(mode);

    this.modalCtr
      .create({
        component: CreateBookingComponent,
        componentProps: { selectedPlace: this.loadedPlace, selectedMode: mode },
      })
      .then((modalElm) => {
        modalElm.present();
        //This could be chained to the before then using return statement
        modalElm.onDidDismiss().then((resultData) => {
          console.log(resultData);
          if (resultData.role != null && resultData.role === 'confirm') {
            this.loadingCtr
              .create({ message: 'Booking place...' })
              .then((loadingEl) => {
                loadingEl.present();
                const bookingData = resultData.data.bookingData;
                this.bookingService
                  .addBooking(
                    this.loadedPlace.id,
                    this.loadedPlace.title,
                    this.loadedPlace.imageUrl,
                    bookingData.firstName,
                    bookingData.lastName,
                    bookingData.guestNumber,
                    bookingData.startDate,
                    bookingData.endDate
                  )
                  .subscribe(() => loadingEl.dismiss());
              });
          }
        });
      });
  }

  onShowFullMap() {
    this.modalCtr
      .create({
        component: MapModalComponent,
        componentProps: {
          center: {
            lat: this.loadedPlace.location.lat,
            lng: this.loadedPlace.location.lng,
          },
          selectable: false,
          closeButtonText: 'Close',
          titleText: this.loadedPlace.location.address,
        },
      })
      .then((modalEl) => modalEl.present());
  }
}
