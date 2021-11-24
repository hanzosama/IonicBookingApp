import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
<<<<<<< HEAD
import { take, map, tap, delay, filter } from 'rxjs/operators';
=======
import { take, map, tap, delay } from 'rxjs/operators';
>>>>>>> 381d3d2146fb7de7dd347296f7e5f7f4f41d0f73
import { AuthenticationService } from '../auth/authentication.service';
import { Place } from './place.model';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([
    new Place(
      'p1',
      'Manhatan',
      'Hearth of new york',
      'https://www.privatewallmag.com/wp-content/uploads/MANHATTAN-800x400.jpg',
      100.0,
      new Date('2019-01-01'),
      new Date('2019-12-31'),
      'u1'
    ),
    new Place(
      'p2',
      "L'Amour Toujours",
      'Romantic place in paris',
      'https://tophotel.news/wp-content/uploads/2018/12/25hours-francess.jpg',
      99.99,
      new Date('2019-01-01'),
      new Date('2019-12-31'),
      'u1'
    ),
    new Place(
      'p3',
      'Bogotá D.C',
      'The best City, the SIN CITY!',
      'https://es.investinbogota.org/sites/default/files/node/news/field_news_imagen/Emprendimientos%20en%20Bogota%CC%81.jpg',
      10.99,
      new Date('2019-01-01'),
      new Date('2019-12-31'),
      'u1'
    ),
  ]);
  constructor(private authService: AuthenticationService) {}

  get places() {
    return this._places.asObservable();
  }

  getPlaces(id: string) {
    return this.places.pipe(
      take(1),
      map((places) => {
        return { ...places.find((p) => p.id === id) };
      })
    );
  }

  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    const newPlace = new Place(
      Math.random().toString(),
      title,
      description,
      'https://tophotel.news/wp-content/uploads/2018/12/25hours-francess.jpg',
      price,
      dateFrom,
      dateTo,
      this.authService.userId
    );

    return this.places.pipe(
      take(1),
      delay(1000),
      tap((places) => {
        //adding request simulation
        this._places.next(places.concat(newPlace));
      })
    );
  }

  updatePlace(id: string, title: string, description: string) {
    return this.places.pipe(
      take(1),delay(1000),
      tap((places) => {
        const updatePlaceIndex = places.findIndex((pl) => pl.id === id);
        const updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatePlaceIndex];
        updatedPlaces[updatePlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.avaliableTo,
          oldPlace.userId
        );
        this._places.next(updatedPlaces);
      })
    );
  }
}
