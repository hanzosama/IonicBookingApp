export class Place {
  constructor(
    public id: string,
    public tittle: string,
    public description: string,
    public imageUrl: string,
    public price: number,
    public availableFrom: Date,
    public avaliableTo: Date,
    public userId: string
  ) { }
}
