import { Injectable } from '@angular/core';
import { Place } from './place.model';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private _places: Place[] = [
    new Place(
      'p1',
      'Manhatan',
      'Hearth of new york',
      'https://www.privatewallmag.com/wp-content/uploads/MANHATTAN-800x400.jpg',
      100.0,
      new Date('2019-01-01'),
      new Date('2019-12-31')
    ),
    new Place(
      'p2',
      "L'Amour Toujours",
      'Romantic place in paris',
      'https://tophotel.news/wp-content/uploads/2018/12/25hours-francess.jpg',
      99.99,
      new Date('2019-01-01'),
      new Date('2019-12-31')
    ),
    new Place(
      'p3',
      'Bogotá D.C',
      'The best City, the SIN CITY!',
      'https://es.investinbogota.org/sites/default/files/node/news/field_news_imagen/Emprendimientos%20en%20Bogota%CC%81.jpg',
      10.99,
      new Date('2019-01-01'),
      new Date('2019-12-31')
    ),
  ];
  constructor() {}

  get places() {
    return [...this._places];
  }

  getPlaces(id: string) {
    return { ...this._places.find((places) => places.id === id) };
  }
}
