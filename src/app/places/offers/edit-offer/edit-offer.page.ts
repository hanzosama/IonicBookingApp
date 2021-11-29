import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertController,
  LoadingController,
  NavController,
} from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Place } from '../../place.model';
import { PlacesService } from '../../places-service.service';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {
  offerEdited: Place;
  form: FormGroup;
  isLoading = false;
  offerId: string;
  private placesSubject: Subscription;

  constructor(
    private placesService: PlacesService,
    private route: ActivatedRoute,
    private navController: NavController,
    private router: Router,
    private loaderCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap) => {
      if (!paramMap.has('offerId')) {
        this.offerId = paramMap.get('offerId');
        this.navController.navigateBack('/places/tabs/offers');
        return;
      }
      this.isLoading = true;
      this.placesSubject = this.placesService
        .getPlaces(paramMap.get('offerId'))
        .subscribe(
          (place) => {
            this.offerEdited = place;

            this.form = new FormGroup({
              title: new FormControl(this.offerEdited.title, {
                updateOn: 'blur',
                validators: [Validators.required],
              }),
              description: new FormControl(this.offerEdited.description, {
                updateOn: 'blur',
                validators: [Validators.required, Validators.maxLength(180)],
              }),
            });
            this.isLoading = false;
          },
          (error) => {
            this.alertCtrl
              .create({
                header: 'Error Ocurr',
                message: 'Error loading the offer',
                buttons: [
                  {
                    text: 'Ok',
                    handler: () =>
                      this.router.navigate(['/places/tabs/offers']),
                  },
                ],
              })
              .then((alertEl) => {
                alertEl.present();
              });
          }
        );
    });
  }

  ngOnDestroy(): void {
    if (this.placesSubject) {
      this.placesSubject.unsubscribe();
    }
  }

  onUpdateOffer() {
    if (!this.form.valid) {
      return;
    }
    this.loaderCtrl
      .create({ message: 'Updating place...' })
      .then((loadingEl) => {
        loadingEl.present();
        this.placesService
          .updatePlace(
            this.offerEdited.id,
            this.form.value.title,
            this.form.value.description
          )
          .subscribe(() => {
            loadingEl.dismiss();
            this.form.reset();
            this.router.navigateByUrl('/places/tabs/offers');
          });
      });

    console.log(this.form);
  }
}
