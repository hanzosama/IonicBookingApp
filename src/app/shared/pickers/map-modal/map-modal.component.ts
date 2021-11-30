import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('map') mapElementRef: ElementRef;
  clickListener: any;
  googleMap: any;
  constructor(
    private modaltCtr: ModalController,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit(): void {
    this.getGoogleMaps()
      .then((googleMaps) => {
        this.googleMap = googleMaps;
        const mapEl = this.mapElementRef.nativeElement;
        const map = new googleMaps.Map(mapEl, {
          center: { lat: -34.397, lng: 150.644 },
          zoom: 16,
        });
        googleMaps.event.addListenerOnce(map, 'idle', () => {
          this.renderer.addClass(mapEl, 'visible');
        });
        this.clickListener = map.addListener('click', (event) => {
          const selectedCoords = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          };
          this.modaltCtr.dismiss(selectedCoords);
        });
      })
      .catch((error) => console.log(error));
  }

  ngOnInit() {}

  ngOnDestroy(): void {
    this.googleMap.event.removeListener(this.clickListener);
  }

  onCancel() {
    this.modaltCtr.dismiss();
  }

  private getGoogleMaps(): Promise<any> {
    const win = window as any;
    const googleModule = win.google;
    if (googleModule && googleModule.maps) {
      return Promise.resolve(googleModule.maps);
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleApiKey}`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        const loadedGoogleModule = win.google;
        if (loadedGoogleModule && loadedGoogleModule.maps) {
          return resolve(loadedGoogleModule.maps);
        } else {
          reject('Google Map not available');
        }
      };
    });
  }
}
