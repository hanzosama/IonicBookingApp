import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthenticationService } from '../auth/authentication.service';
import { Booking } from './booking.model';

const bookingsPath = 'bookings.json';

interface BookingData {
  bookedFrom: string;
  bookedTo: string;
  guestNumber: number;
  lastName: string;
  firstName: string;
  placeId: string;
  placeImage: string;
  placeTitle: string;
  userId: string;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private _bookings = new BehaviorSubject<Booking[]>([]);

  constructor(
    private authService: AuthenticationService,
    private http: HttpClient
  ) {}

  get bookings() {
    return this._bookings.asObservable();
  }

  fecthBookins() {
    return this.http
      .get<{ [key: string]: BookingData }>(
        environment.firebaseAPIMainURL +
          bookingsPath +
          `?orderBy="userId"&equalTo="${this.authService.userId}"`
      )
      .pipe(
        map((bookingData) => {
          const bookings = [];
          for (const key in bookingData) {
            if (bookingData.hasOwnProperty(key)) {
              bookings.push(
                new Booking(
                  key,
                  bookingData[key].placeId,
                  bookingData[key].userId,
                  bookingData[key].placeTitle,
                  bookingData[key].placeImage,
                  bookingData[key].firstName,
                  bookingData[key].lastName,
                  bookingData[key].guestNumber,
                  new Date(bookingData[key].bookedFrom),
                  new Date(bookingData[key].bookedTo)
                )
              );
            }
          }
          return bookings;
        }),
        take(1),
        tap((bookings) => {
          this._bookings.next(bookings);
        })
      );
  }

  addBooking(
    placeId: string,
    placeTitle: string,
    placeImage: string,
    firstName: string,
    lastName: string,
    guestNumber: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    let generatedId: string;
    const newBooking = new Booking(
      Math.random().toString(),
      placeId,
      this.authService.userId,
      placeTitle,
      placeImage,
      firstName,
      lastName,
      guestNumber,
      dateFrom,
      dateTo
    );

    return this.http
      .post<{ name: string }>(environment.firebaseAPIMainURL + bookingsPath, {
        ...newBooking,
        id: null,
      })
      .pipe(
        switchMap((restData) => {
          generatedId = restData.name;
          return this.bookings;
        }),
        take(1),
        tap((bookings) => {
          newBooking.id = generatedId;
          this._bookings.next(bookings.concat(newBooking));
        })
      );
  }

  cancelBooking(id: string) {
    return this.http.delete(environment.firebaseAPIMainURL + `bookings/${id}.json`).pipe(
      switchMap(() => this.bookings),
      take(1),
      tap((bookings) => {
        this._bookings.next(bookings.filter((b) => b.id !== id));
      })
    );
  }
}
