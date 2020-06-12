import {BaseModel, ConversionType, JsonProperty, ToConvert, ToNumber} from './base.model';

export class Product extends BaseModel {
  public constructor(data: {}) {
    super(data);
  }

  @JsonProperty(['itemId'])
  id: string;

  @JsonProperty(['shortDescription'])
  description: string;

  @JsonProperty(['brandName', 'name'])
  @ToConvert((name: string) => {
    const match = (name || '').split('"')[0].match(/[a-zA-Z ]+/);
    return match && match[0].trim() || '';
  })
  brandName: string;

  @JsonProperty(['name'])
  @ToConvert((name: string) => name.replace('"', ''))
  name: string;

  @JsonProperty(['msrp'])
  originalPrice: number;

  @JsonProperty(['itemId'])
  internalId: number;

  @JsonProperty(['largeImage'])
  imagePath: string;

  @JsonProperty(['modelNumber'])
  modelNumber: string;

  @JsonProperty(['customerRating'])
  @ToNumber(ConversionType.DECIMAL)
  rating: string;

  @JsonProperty(['numReviews'])
  nrReviews: number;

  @JsonProperty(['stock'])
  availability: string;

  @JsonProperty(['imageEntities'])
  @ToConvert((rawImages: Array<{mediumImage: string}>) => rawImages.map((r) => r.mediumImage))
  images: string[];
}
