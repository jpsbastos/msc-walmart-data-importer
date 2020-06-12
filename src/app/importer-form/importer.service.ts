import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, concat, forkJoin, Observable, of, Subject, zip} from 'rxjs';
import {Product} from '../models/product.model';
import {delay, map, switchMap} from 'rxjs/operators';
import {Review} from '../models/review.model';
import {BaseModel} from '../models/base.model';


export const ServiceConstants = {
  WALMART_API_KEY: '7eksjp57nqzw9hnb9hsudh93',
  FIREBASE_APIKEY: 'AIzaSyCMXCKt7Qx4fXAeCKwaw4gUC0-82Pmhia8',
  FIREBASE_ENDPOINT: 'https://jpsbastos-msc-microfrontends.firebaseio.com/',
  TELLCO_ENDPOINT: 'http://localhost:3000/',
  EMAIL: 'jps.bastos.1110@gmail.com',
  PASSWORD: 'eHKT3pHAx',
  BASE_PATH: 'http://api.walmartlabs.com',
  VERSION: 'v1',
  SIGN_IN_URL: 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=',
  ENDPOINTS: {
    PRODUCT_LOOKUP: 'items',
    RECOMMENDATIONS: 'nbp',
    REVIEWS: 'reviews',
    SEARCH: 'search',
    TRENDS: 'trends',
  }
};

@Injectable({
  providedIn: 'root'
})
export class ImporterService {
  walmartAnswer = new Subject();
  requestType = ServiceConstants.ENDPOINTS.PRODUCT_LOOKUP;

  constructor(private httpClient: HttpClient) {
    this.signIn().subscribe();
  }

  getBasePath(): string {
    const { BASE_PATH, VERSION } = ServiceConstants;
    return `${BASE_PATH}/${VERSION}`;
  }

  getURLPath(specificPath: string, queryParams: { [key: string]: string }): string {
    const { WALMART_API_KEY } = ServiceConstants;
    const queryString = Object.keys(queryParams).reduce(
      (acc, cur) =>
        acc += `&${cur}=${queryParams[cur]}`, '')
    return `${this.getBasePath()}${specificPath ? '/' + specificPath : ''}?apiKey=${WALMART_API_KEY}${queryString}`;
  }

  get<T>(specificPath: string, queryParams: { [key: string]: string }): Observable<T> {
    return this.httpClient.get<T>(this.getURLPath(specificPath, queryParams), {

    });
  }

  post<T>(specificPath: string, body: any): Observable<T> {
    console.log(JSON.stringify(body))
    return this.httpClient.post<T>(specificPath, body, {
    });
  }

  put<T>(specificPath: string, body: any): Observable<T> {
    console.log(JSON.stringify(body))
    return this.httpClient.put<T>(specificPath, body, {
    });
  }

  signIn(): Observable<{}> {
    const { EMAIL, FIREBASE_APIKEY, PASSWORD, SIGN_IN_URL } = ServiceConstants;
    return this.httpClient.post(
      SIGN_IN_URL + FIREBASE_APIKEY, {
        email: EMAIL,
        password: PASSWORD,
        returnSecureToken: true,
      });
  }

  getProducts(
    productId: string,
    queryParams: { [key: string]: string },
    ): Observable<Product[]> {
    const specificPath = `${ServiceConstants.ENDPOINTS.PRODUCT_LOOKUP}${productId ? '/' + productId : ''}`;
    return this.get<{ items: Array<{[key: string]: string }>}>(specificPath, queryParams).pipe(
      map((data) => (this.convertJsonToModel(data.items)) as Product[]),
    );
  }

  getRecommendations(
    queryParams: { [key: string]: string },
  ): Observable<Product[]> {
    return this.get<{ items: Array<{[key: string]: string }>}>(ServiceConstants.ENDPOINTS.RECOMMENDATIONS, queryParams).pipe(
      map((data) => (this.convertJsonToModel(data.items)) as Product[]),
    );
  }

  getReviews(
    productId: string,
    queryParams: { [key: string]: string },
  ): Observable<Review[]> {
    this.httpClient.get('http://localhost:3000/products').subscribe((data: any[]) => {
      console.log(data.map((d) => d.internalId))
    });
    const urlToRequest = `${ServiceConstants.ENDPOINTS.REVIEWS}/${productId}`;
    return this.get<{ itemId: number, reviews: Array<{[key: string]: string }>}>(urlToRequest, queryParams).pipe(
      map((data) => (this.convertJsonToModel((data?.reviews || []).map((r) => ({ ...r, productId: data.itemId})), 'reviews')) as Review[]),
    );
  }

  getSearchResults(
    queryParams: { [key: string]: string },
  ): Observable<Product[]> {
    return this.get<{ items: Array<{[key: string]: string }>}>(ServiceConstants.ENDPOINTS.SEARCH, queryParams).pipe(
      map((data) => (this.convertJsonToModel(data.items)) as Product[]),
    );
  }

  getTrends(
    queryParams: { [key: string]: string },
  ): Observable<Product[]> {
    return this.get<{ items: Array<{[key: string]: string }>}>(ServiceConstants.ENDPOINTS.TRENDS, queryParams).pipe(
      map((data) => (this.convertJsonToModel(data.items)) as Product[]),
    );
  }

  postProducts2(body: any): Observable<{}> {
    console.log(JSON.stringify(body));
    const { FIREBASE_ENDPOINT } = ServiceConstants;
    return this.put(FIREBASE_ENDPOINT + 'products.json', body);
  }

  postProducts(products: Product[]): Observable<{}> {
    console.log(JSON.stringify(products));
    const { TELLCO_ENDPOINT } = ServiceConstants;
    return this.post(TELLCO_ENDPOINT + 'products/bulk', products);
  }

  postReviews(reviews: Review[]): Observable<{}> {
    console.log(JSON.stringify(reviews));
    const { TELLCO_ENDPOINT, ENDPOINTS } = ServiceConstants;
    return this.post(TELLCO_ENDPOINT + ENDPOINTS.REVIEWS + '/bulk', reviews);
  }

  convertJsonToModel(rawData: Array<{}>| {}, type = 'product'): BaseModel | BaseModel[] {
    return Array.isArray(rawData) ?
      rawData.map((i) => type === 'reviews' ? new Review(i) : new Product((i))) :
      type === 'reviews' ? new Review(rawData) : new Product(rawData);
  }
}
