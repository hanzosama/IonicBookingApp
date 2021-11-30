import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthenticationService } from '../auth/authentication.service';
import { Place } from './place.model';

interface PlaceData {
  availableFrom: string;
  avaliableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
}


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
        .get<{ [key: string]: PlaceData }>(environment.firebaseAPIMainURL+ placesPath)
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
      .get<PlaceData>(environment.firebaseAPIMainURL + `offered-places/${id}.json`)
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
      .post<{ name: string }>(environment.firebaseAPIMainURL + placesPath, { ...newPlace, id: null })
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
        return this.httpClient.put(environment.firebaseAPIMainURL + `offered-places/${id}.json`, {
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
