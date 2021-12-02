/* eslint-disable no-underscore-dangle */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthenticationService } from '../auth/authentication.service';
import { PlaceLocation } from './location.model';
import { Place } from './place.model';

interface PlaceData {
  availableFrom: string;
  avaliableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
  location: PlaceLocation;
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
    return this.authService.token.pipe(
      take(1),
      switchMap((token) =>
        this.httpClient
          // key word is use as a placehorlder to get the hidden value
          .get<{ [key: string]: PlaceData }>(
            environment.firebaseAPIMainURL + placesPath + `?auth=${token}`
          )
      ),
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
                data[key].userId,
                data[key].location
              )
            );
          }
        }
        return places;
      }),
      tap((places) => {
        this._places.next(places);
      })
    );
  }

  getPlaces(id: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap((token) =>
        this.httpClient.get<PlaceData>(
          environment.firebaseAPIMainURL +
            `offered-places/${id}.json?auth=${token}`
        )
      ),
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
            placeData.userId,
            placeData.location
          )
      )
    );
  }

  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date,
    location: PlaceLocation,
    imageUrl: string
  ) {
    let generatedId = '';
    let newPlace: Place;
    let fetchUserId: string;
    return this.authService.userId.pipe(
      take(1),
      switchMap((userId) => {
        fetchUserId = userId;
        return this.authService.token;
      }),
      take(1),
      switchMap((token) => {
        if (!fetchUserId) {
          throw new Error('User not found');
        }
        newPlace = new Place(
          Math.random().toString(),
          title,
          description,
          imageUrl,
          price,
          dateFrom,
          dateTo,
          fetchUserId,
          location
        );
        return this.httpClient.post<{ name: string }>(
          environment.firebaseAPIMainURL + placesPath + `?auth=${token}`,
          {
            ...newPlace,
            id: null,
          }
        );
      }),
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
    let fectchToken: string;
    return this.authService.token.pipe(
      take(1),
      switchMap((token) => {
        fectchToken = token;
        return this.places;
      }),
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
          oldPlace.userId,
          oldPlace.location
        );
        return this.httpClient.put(
          environment.firebaseAPIMainURL +
            `offered-places/${id}.json?auth=${fectchToken}`,
          {
            ...updatedPlaces[updatePlaceIndex],
            id: null,
          }
        );
      }),
      tap(() => {
        this._places.next(updatedPlaces);
      })
    );
  }

  uploadImage(image: File) {
    console.log(image);

    const uploadData = new FormData();
    uploadData.append('image', image);

    return this.authService.token.pipe(
      take(1),
      switchMap((token) =>
        this.httpClient.post<{ imageUrl: string; imagePath: string }>(
          environment.storageCustomFirebaseFuntionURL,
          uploadData,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          { headers: { Authorization: 'Bearer ' + token } }
        )
      )
    );
  }
}
