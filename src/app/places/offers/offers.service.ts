/* eslint-disable max-len */
import { Injectable } from '@angular/core';
import { Offer } from './offers-model';

@Injectable({
  providedIn: 'root'
})
export class OffersService {

  private _offers: Offer[] = [
    new Offer(
      'o1',
      'Riu Plaza Manhattan Times Square',
      'El Riu Plaza Manhattan Times Square está ubicado en Nueva York, a 300 metros de Times Square y del auditorio Radio City Music Hall, y cuenta con bar y terraza.',
      'https://cf.bstatic.com/xdata/images/hotel/square600/280458338.webp?k=8183a5b93589b530267c736991740dc727fc68ee5781efabba3915a41c195d8d&o=&s=1',
      80.0)
    ,
    new Offer('o2',
      'ibis Budget Paris La Villette 19ème',
      'El ibis Budget Paris La Villette 19ème ofrece WiFi gratuita en todas las zonas y se halla a 2 minutos a pie del lago artificial Bassin de la Villette y a 2,1 km de la plaza de la República.',
      'https://cf.bstatic.com/xdata/images/hotel/max1024x768/307820360.jpg?k=e2c8a666b62e08551f19c9283a84999ebc913b54a1e7007c6d764f59d362664c&o=&hp=1',
      99.99)
    ,
    new Offer('o3',
      'Hotel Bogotá Regency Usaquén ',
      'El Bogotá Regency se encuentra en el tradicional barrio Usaquén de Bogotá, a 1,5 km del centro comercial Unicentro. Todas las habitaciones tienen TV por cable de pantalla plana y WiFi gratuita.',
      'https://cf.bstatic.com/xdata/images/hotel/max1024x768/77083665.jpg?k=2e3f624487f2028ce8de10b8252b89bd77b902118253ebcef7df6c4e805a1e5b&o=&hp=1',
      10.99)
  ];
  constructor() { }

  get offers() {
    return [...this._offers];
  }

  getOffer(id: string) {
    //cloning response
    return {...this._offers.find(offers => offers.id === id)};
  }
}
