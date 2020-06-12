import { Component, OnInit } from '@angular/core';
import { ImporterService, ServiceConstants } from './importer.service';
import { Observable, of } from 'rxjs';
import { BaseModel } from '../models/base.model';
import {AbstractControl, FormArray, FormControl, FormGroup, NgForm, Validators} from '@angular/forms';

@Component({
  selector: 'app-importer-form',
  templateUrl: './importer-form.component.html',
  styleUrls: ['./importer-form.component.scss']
})
export class ImporterFormComponent implements OnInit {
  importerForm: FormGroup;
  availableEndpoints: { label: string; value: string }[] = [];
  constructor(private importerService: ImporterService) { }

  ngOnInit(): void {
    this.setEndpointsInfo();
    this.importerForm = new FormGroup({
      itemID: new FormControl(null),
      requestType: new FormControl(ServiceConstants.ENDPOINTS.PRODUCT_LOOKUP, Validators.required),
      queryParams: new FormArray([this.generateQueryParam()])
    });
  }

  get queryParams(): FormArray {
    return (this.importerForm.get('queryParams') as FormArray);
  }

  get queryParamsControls(): AbstractControl[] {
    return this.queryParams.controls;
  }

  onAddQueryParam(): void {
    this.queryParams.push(this.generateQueryParam());
  }

  generateQueryParam(): FormGroup {
    return new FormGroup({
      key: new FormControl(null, Validators.required),
      value: new FormControl(null, Validators.required)
    });
  }

  addQueryParam(event: Event): void {
    event.preventDefault();
    this.onAddQueryParam();
  }

  deleteQueryParam(index: number): void {
    this.queryParams.removeAt(index);
  }

  processedQueryParams(rawQueryParams: { key: string; value: string }[])
    : { [key: string]: string } {
    return rawQueryParams.reduce((acc, current) => {
      acc[current.key] = current.value;
      return acc;
    }, {});
  }

  setEndpointsInfo(): void {
    this.availableEndpoints = Object.keys(ServiceConstants.ENDPOINTS)
      .map((key) => ({
        label: key.slice().replace('_', ' '),
        value: ServiceConstants.ENDPOINTS[key],
      }));
  }

  onSubmit(): void {
    const {
      PRODUCT_LOOKUP,
      RECOMMENDATIONS,
      REVIEWS,
      SEARCH,
      TRENDS,
    } = ServiceConstants.ENDPOINTS;

    const { itemID, requestType, queryParams } = this.importerForm.value;
    this.importerService.requestType = requestType;

    const processQueryParams = this.processedQueryParams(queryParams);
    let observable: Observable<BaseModel[]>;
    switch (requestType) {
      case PRODUCT_LOOKUP:
        observable = this.importerService.getProducts(itemID ? itemID : '', processQueryParams);
        break;
      case RECOMMENDATIONS:
        observable = this.importerService.getRecommendations(processQueryParams);
        break;
      case REVIEWS:
        observable = this.importerService.getReviews(itemID ? itemID : '', processQueryParams);
        break;
      case SEARCH:
        observable = this.importerService.getSearchResults(processQueryParams);
        break;
      case TRENDS:
        observable = this.importerService.getTrends(processQueryParams);
        break;
      default:
        observable = of([])
        break;
    }

    observable.subscribe((data) => {
      console.log(data)
      this.importerService.walmartAnswer.next(data);
    });
  }

}
