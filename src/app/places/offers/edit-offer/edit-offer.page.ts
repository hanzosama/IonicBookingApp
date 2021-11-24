import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
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
  private placesSubject: Subscription;

  constructor(
    private placesService: PlacesService,
    private route: ActivatedRoute,
    private navController: NavController
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap) => {
      if (!paramMap.has('offerId')) {
        this.navController.navigateBack('/places/tabs/offers');
        return;
      }

      this.placesSubject = this.placesService
        .getPlaces(paramMap.get('offerId'))
        .subscribe((place) => {
          this.offerEdited = place;

          this.form = new FormGroup({
            title: new FormControl(this.offerEdited.tittle, {
              updateOn: 'blur',
              validators: [Validators.required],
            }),
            description: new FormControl(this.offerEdited.description, {
              updateOn: 'blur',
              validators: [Validators.required, Validators.maxLength(180)],
            }),
          });
        });
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

    console.log(this.form);
  }
}
