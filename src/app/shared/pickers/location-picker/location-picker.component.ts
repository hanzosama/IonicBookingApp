import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  ActionSheetController,
  AlertController,
  ModalController,
} from '@ionic/angular';
import { map, switchMap } from 'rxjs/operators';
import { Coordinates, PlaceLocation } from '../../../places/location.model';
import { environment } from '../../../../environments/environment';
import { MapModalComponent } from '../map-modal/map-modal.component';
import { of } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {
  @Output() locationPick = new EventEmitter<PlaceLocation>();
  @Input() showPreview = false;
  selectedLocationImage: string;
  isLoading = false;

  constructor(
    private modalCtr: ModalController,
    private http: HttpClient,
    private actionSheetCtr: ActionSheetController,
    private alertCtr: AlertController
  ) {}

  ngOnInit() {}

  onPickLocation() {
    this.actionSheetCtr
      .create({
        header: 'Please Choose',
        buttons: [
          { text: 'Auto-locate', handler: () => this.locateUser() },
          { text: 'Pick on Map', handler: () => this.openMap() },
          { text: 'Cancel', role: 'cancel' },
        ],
      })
      .then((actionSheetEl) => {
        actionSheetEl.present();
      });
  }

  private openMap() {
    this.modalCtr.create({ component: MapModalComponent }).then((modalEl) => {
      modalEl.onDidDismiss().then((modalData) => {
        if (!modalData) {
          return;
        }
        const coordinates: Coordinates = {
          lat: modalData.data.lat,
          lng: modalData.data.lng,
        };
        this.createPlaceToPick(coordinates.lat, coordinates.lng);
      });
      modalEl.present();
    });
  }

  private createPlaceToPick(latitude: number, longitude: number) {
    const pickedLocation: PlaceLocation = {
      lat: latitude,
      lng: longitude,
      address: null,
      staticMapImageURL: null,
    };
    this.isLoading = true;
    this.getAdress(latitude, longitude)
      .pipe(
        switchMap((address) => {
          pickedLocation.address = address;
          return of(
            this.getImagePlace(pickedLocation.lat, pickedLocation.lng, 14)
          );
        })
      )
      .subscribe((staticImageURL) => {
        pickedLocation.staticMapImageURL = staticImageURL;
        this.selectedLocationImage = staticImageURL;
        this.isLoading = false;
        this.locationPick.emit(pickedLocation);
      });
  }

  private locateUser() {
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      this.showErrorAlertLocation();
      return;
    }
    this.isLoading = true;
    Geolocation.getCurrentPosition()
      .then((position) => {
        if (position.coords) {
          const coordinates: Coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          this.createPlaceToPick(coordinates.lat, coordinates.lng);
          this.isLoading = false;
        }
      })
      .catch((err) => {
        this.isLoading = false;
        this.showErrorAlertLocation();
      });
  }

  private showErrorAlertLocation() {
    this.alertCtr
      .create({
        header: 'Could not get location',
        message: 'Use the map to pick a location',
        buttons:['Ok']
      })
      .then((alertEl) => alertEl.present());
  }

  private getAdress(lat: number, lng: number) {
    return this.http
      .get<any>(
        `${environment.geoCodeAPIURL}?latlng=${lat},${lng}&key=${environment.googleApiKey}`
      )
      .pipe(
        map((geoData) => {
          if (!geoData || !geoData.results || geoData.results.length === 0) {
            return null;
          }
          return geoData.results[0].formatted_address;
        })
      );
  }

  private getImagePlace(lat: number, lng: number, zoomLvl: number) {
    return `${environment.staticMapAPIURL}?center=${lat},${lng}&zoom=${zoomLvl}&size=500x300&maptype=roadmap
 &markers=color:red%7Clabel:PlaceC%7C${lat},${lng}
 &key=${environment.googleApiKey}`;
  }
}
