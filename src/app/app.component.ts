import {Component, OnDestroy, OnInit} from '@angular/core';
import {ImporterService, ServiceConstants} from './importer-form/importer.service';
import {Observable, of, Subscription} from 'rxjs';
import {BaseModel} from './models/base.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'msc-walmart-data-importer';
  subscription: Subscription;
  formattedObject = '';
  jsonObject = null;

  constructor(private importerService: ImporterService) {
  }

  ngOnInit(): void {
    this.subscription = this.importerService.walmartAnswer.subscribe((data) => {
      this.formattedObject = JSON.stringify(data, null, 2);
      this.jsonObject = data;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onImport(): void {
    let observable: Observable<{}>;
    if (this.importerService.requestType === ServiceConstants.ENDPOINTS.REVIEWS) {
      observable = this.importerService.postReviews(this.jsonObject);
    } else {
      observable = this.importerService.postProducts(this.jsonObject);
    }

    observable.subscribe((data) => {
      console.log('SUCCESS', data);
    });
  }
}
