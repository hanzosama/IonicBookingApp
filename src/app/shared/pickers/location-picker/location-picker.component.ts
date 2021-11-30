import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { map, switchMap } from 'rxjs/operators';
import { PlaceLocation } from '../../../places/location.model';
import { environment } from '../../../../environments/environment';
import { MapModalComponent } from '../map-modal/map-modal.component';
import { of } from 'rxjs';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {

  @Output() locationPick = new EventEmitter<PlaceLocation>();
  selectedLocationImage: string;
  isLoading = false;

  constructor(private modalCtr: ModalController, private http: HttpClient) {}

  ngOnInit() {}

  onPickLocation() {
    this.modalCtr.create({ component: MapModalComponent }).then((modalEl) => {
      modalEl.onDidDismiss().then((modalData) => {
        if (!modalData) {
          return;
        }
        const pickedLocation: PlaceLocation = {
          lat: modalData.data.lat,
          lng: modalData.data.lng,
          address: null,
          staticMapImageURL: null,
        };
        this.isLoading = true;
        this.getAdress(modalData.data.lat, modalData.data.lng)
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
      });
      modalEl.present();
    });
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
