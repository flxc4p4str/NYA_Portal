import { Component, OnInit } from '@angular/core';
import { DataService } from '../../data.service';
import { DataTableModule, SharedModule } from 'primeng/primeng';
import { ABSFunctions } from '../../abs.functions';
import { BaThemePreloader, BaThemeSpinner } from '../../theme/services';

@Component({
  selector: 'nga-ucc',
  styleUrls: ['./ucc.scss'],
  templateUrl: './ucc.html',
})
export class UccComponent implements OnInit {
  
  constructor(private absFunctions: ABSFunctions, private _dataService: DataService, private _spinner: BaThemeSpinner,
  ) {
  }

  ngOnInit() {

    // this._spinner.show({ 'top': '85px', 'background': '#F0F3F4', 'display': 'flex' });

  }

}
