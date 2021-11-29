import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, switchMap } from 'rxjs/operators';
import { AuthenticationService } from '../auth/authentication.service';
import { Place } from './place.model';

/* new Place(
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
  'u2'
), */

interface PlaceData {
  availableFrom: string;
  avaliableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
}

const mainUrl = 'https://bookingionicapp-default-rtdb.firebaseio.com/';

const placesPath = 'offered-places.json';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([]);

  constructor(
    private authService: AuthenticationService,
    private httpClient: HttpClient
  ) {}

  get places() {
    return this._places.asObservable();
  }

  fetchPlaces() {
    return (
      this.httpClient
        // key word is use as a placehorlder to get the hidden value
        .get<{ [key: string]: PlaceData }>(mainUrl + placesPath)
        .pipe(
          map((data) => {
            const places = [];
            for (const key in data) {
              if (data.hasOwnProperty(key)) {
                places.push(
                  new Place(
                    key,
                    data[key].title,
                    data[key].description,
                    data[key].imageUrl,
                    data[key].price,
                    new Date(data[key].availableFrom),
                    new Date(data[key].avaliableTo),
                    data[key].userId
                  )
                );
              }
            }
            return places;
          }),
          tap((places) => {
            this._places.next(places);
          })
        )
    );
  }

  getPlaces(id: string) {
    return this.httpClient
      .get<PlaceData>(mainUrl + `offered-places/${id}.json`)
      .pipe(
        map(
          (placeData) =>
            new Place(
              id,
              placeData.title,
              placeData.description,
              placeData.imageUrl,
              placeData.price,
              new Date(placeData.availableFrom),
              new Date(placeData.avaliableTo),
              placeData.userId
            )
        )
      );
  }

  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    let generatedId = '';
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

    return this.httpClient
      .post<{ name: string }>(mainUrl + placesPath, { ...newPlace, id: null })
      .pipe(
        switchMap((resData) => {
          generatedId = resData.name;
          return this.places;
        }),
        take(1),
        tap((places) => {
          newPlace.id = generatedId;
          this._places.next(places.concat(newPlace));
        })
      );
  }

  updatePlace(id: string, title: string, description: string) {
    let updatedPlaces: Place[];
    return this.places.pipe(
      take(1),
      switchMap((placesList) => {
        if (!placesList || placesList.length <= 0) {
          return this.fetchPlaces();
        } else {
          return of(placesList);
        }
      }),
      switchMap((placesList) => {
        const updatePlaceIndex = placesList.findIndex((pl) => pl.id === id);
        updatedPlaces = [...placesList];
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
        return this.httpClient.put(mainUrl + `offered-places/${id}.json`, {
          ...updatedPlaces[updatePlaceIndex],
          id: null,
        });
      }),
      tap(() => {
        this._places.next(updatedPlaces);
      })
    );
  }
}
