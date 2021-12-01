import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-image-picker',
  templateUrl: './image-picker.component.html',
  styleUrls: ['./image-picker.component.scss'],
})
export class ImagePickerComponent implements OnInit {
  @ViewChild('filePicker') filePicker: ElementRef<HTMLInputElement>;
  @Output() imagePicked = new EventEmitter<string | File>();
  selectedImage: string;
  usePicker = false;

  constructor(private plattform: Platform) {}

  ngOnInit() {
    console.log('Mobile:', this.plattform.is('mobile'));
    console.log('Hybrid:', this.plattform.is('hybrid'));
    console.log('iOS:', this.plattform.is('ios'));
    console.log('Android:', this.plattform.is('android'));
    console.log('Desktop:', this.plattform.is('desktop'));
    if (
      (this.plattform.is('mobile') && !this.plattform.is('hybrid')) ||
      this.plattform.is('desktop')
    ) {
      this.usePicker = true;
    }
  }

  onPickImage() {
    if (!Capacitor.isPluginAvailable('Camera') || this.usePicker) {
      this.filePicker.nativeElement.click();
      console.log('Not plugin present');
      return;
    }

    Camera.getPhoto({
      quality: 50,
      source: CameraSource.Prompt,
      correctOrientation: true,
      width: 600,
      resultType: CameraResultType.Uri,
    })
      .then((imageResult) => {
        this.selectedImage = imageResult.webPath;
        this.imagePicked.emit(imageResult.webPath);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  onFileChoosen(event: Event) {
    const pickedFile = (event.target as HTMLInputElement).files[0];
    if (!pickedFile) {
      return;
    }
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const dataUrl = fileReader.result.toString();
      this.selectedImage = dataUrl;
      this.imagePicked.emit(pickedFile);
    };

    fileReader.readAsDataURL(pickedFile);
  }
}
