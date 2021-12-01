import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Photo } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { LoadingController } from '@ionic/angular';
import { switchMap } from 'rxjs/operators';
import { PlaceLocation } from '../../location.model';
import { PlacesService } from '../../places-service.service';

const convertBlobToBase64 = (blob: Blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.page.html',
  styleUrls: ['./new-offer.page.scss'],
})
export class NewOfferPage implements OnInit {
  form: FormGroup;

  constructor(
    private placesService: PlacesService,
    private router: Router,
    private loaderCtr: LoadingController
  ) {}

  ngOnInit() {
    //form to bind with the html code
    this.form = new FormGroup({
      title: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required],
      }),
      description: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(180)],
      }),
      price: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.min(1)],
      }),
      dateFrom: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required],
      }),
      dateTo: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required],
      }),
      location: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null),
    });
  }

  onLocationPicked(locationPicked: PlaceLocation) {
    this.form.patchValue({ location: locationPicked });
  }

  onImagePicked(imageData: string | File) {
    if (typeof imageData === 'string') {
      console.log('Image Data:', imageData);
      this.savePicture(imageData)
        .then((imageSaved) => {
          this.form.patchValue({ image: imageSaved });
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      this.form.patchValue({ image: imageData });
    }
  }

  onCreateOffer() {
    if (!this.form.valid || !this.form.get('image').value) {
      return;
    }
    console.log(this.form.value);
    this.loaderCtr
      .create({ message: 'Saving the place...' })
      .then((loadingEl) => {
        loadingEl.present();
        this.placesService
          .uploadImage(this.form.get('image').value)
          .pipe(
            switchMap((uploadResp) =>
              this.placesService.addPlace(
                this.form.value.title,
                this.form.value.description,
                +this.form.value.price,
                new Date(this.form.value.dateFrom),
                new Date(this.form.value.dateTo),
                this.form.value.location,
                uploadResp.imageUrl
              )
            )
          )
          .subscribe(() => {
            loadingEl.dismiss();
            this.form.reset();
            this.router.navigateByUrl('/places/tabs/offers');
          });
      });
  }

  private async savePicture(webPath: string) {
    // Convert photo to base64 format, required by Filesystem API to save
    const base64Data = await this.readAsBase64(webPath);

    // Write the file to the data directory
    const fileName = new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data,
    });

    // Use webPath to display the new image instead of base64 since it's
    // already loaded into memory
    return {
      filepath: fileName,
      webviewPath: webPath,
    };
  }

  private async readAsBase64(webPath: string) {
    // Fetch the photo, read as a blob, then convert to base64 format
    const response = await fetch(webPath);
    const blob = await response.blob();

    return (await convertBlobToBase64(blob)) as string;
  }
}
