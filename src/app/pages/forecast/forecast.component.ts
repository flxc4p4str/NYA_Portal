import { Component } from '@angular/core';
import { DataService } from '../../data.service';

@Component({
  selector: 'nga-forecast',
  styleUrls: ['./forecast.scss'],
  templateUrl: './forecast.html',
})
export class ForecastComponent {
forcastData: Object;
  constructor(private _dataService: DataService) {
        this._dataService.getForcastData()
      .subscribe(result => {
        this.forcastData = result;
        console.info('fcd', this.forcastData);
      });
  }

}
