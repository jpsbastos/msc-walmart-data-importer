import {BaseModel, ConversionType, JsonProperty, ToNumber} from './base.model';

export class Review extends BaseModel {
  public constructor(data: {}) {
    super(data);
  }

  @JsonProperty(['name'])
  name: string;

  @JsonProperty(['productId'])
  productId: number;

  @JsonProperty(['overallRating.rating'])
  rating: number;

  @JsonProperty(['reviewer'])
  username: string;

  @JsonProperty(['reviewText'])
  text: string;

  @JsonProperty(['submissionTime'])
  date: string;

  @JsonProperty(['title'])
  title: string;

  @JsonProperty(['upVotes'])
  upVotes: number;

  @JsonProperty(['downVotes'])
  downVotes: number;
}
