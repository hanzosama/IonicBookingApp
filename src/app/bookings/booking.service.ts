import { Injectable } from '@angular/core';
import { Booking } from './booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private _bookings: Booking[] = [
    {
      id: 'xyz',
      placeId: 'p1',
      placeTitle: 'Manhatan Mansio',
      guestNumber: 2,
      userId: 'u1'
    }
  ];
  get bookings() {
    return [...this._bookings];
  }
}
