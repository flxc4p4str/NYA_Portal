import { Component, OnInit } from '@angular/core';
import { DataService } from '../../data.service';
import { DataTableModule, SharedModule } from 'primeng/primeng';
import { ABSFunctions } from '../../abs.functions';

@Component({
  selector: 'nga-purchase-orders',
  styleUrls: ['./purchaseOrders.scss'],
  templateUrl: './purchaseOrders.html',
})
export class PurchaseOrdersComponent implements OnInit {
  POTORDR1s: any[];
  POTORDR1s_ds: any[];
  errorMessage: any;
  selectedPO: any;
  cols: any[];
  brands: any[];
  selectedPOs: any[];
  showPO: string;
  poSelected: boolean;
  detailView: boolean;
  POTORDR2s: any[];
  totalRecords: number;
  constructor(private absFunctions: ABSFunctions, private _dataService: DataService
  ) {
  }

  ngOnInit() {

    this._dataService.getOpenPOs()
      .subscribe(
      x => {
        if (x) {

          for (let po of x) {
            po.poDateShipByMin_f = this.absFunctions.formatDate(po.poDateShipByMin, "MM/dd/yyyy");
            po.poDateEta_f = this.absFunctions.formatDate(po.poDateEta, "MM/dd/yyyy");
          }
this.totalRecords = x.length;
this.POTORDR1s_ds = x;
          //this.POTORDR1s = x.slice(0, 10);
          this.POTORDR1s = x;
        } else {
          this.POTORDR1s_ds = null;
          this.POTORDR1s = null; // this.BSTCBSCM_empty;
        }
      },
      error => this.errorMessage = <any>error);
  }
  showPODetails(PO) {
    this._dataService.getPO(PO)
      .subscribe(
      x => {
        if (x) {
          for (let pod of x) {
            pod.poDateShipBy_f = this.absFunctions.formatDate(pod.poDateShipBy, "MM/dd/yyyy");
            pod.poDateEta_f = this.absFunctions.formatDate(pod.poDateEta, "MM/dd/yyyy");
          }          
          this.POTORDR2s = x; // x.slice(x.length-5);
          this.showPO = PO;
        } else {
          this.POTORDR2s = null; // this.BSTCBSCM_empty;
        }
      },
      error => this.errorMessage = <any>error);
  }
  sortByWordLength = (a: any) => {
    return a.poFobDesc.length;
  }
  onRowHeaderSelect(event) {
    this.poSelected = true;
    if (this.showPO === event.data.poOrderNo) {
      this.onRowHeaderUnselect(event);
    } else {
      this.showPODetails(event.data.poOrderNo);
      // this.POTORDR1s = event.data;
    }
  }

  onRowHeaderUnselect(event) {
    // event.data.vin
    this.poSelected = false;
    this.selectedPO = {};
    this.POTORDR2s = [];
    // this.POTORDR1s = this.POTORDR1s_orig;
  }
/*    loadPOLazy(event: LazyLoadEvent) {
        //in a real application, make a remote request to load data using state metadata from event
        //event.first = First row offset
        //event.rows = Number of rows per page
        //event.sortField = Field name to sort with
        //event.sortOrder = Sort order as number, 1 for asc and -1 for dec
        //filters: FilterMetadata object having field as key and filter value, filter matchMode as value
        
        //imitate db connection over a network
            if(this.POTORDR1s_ds) {
                this.POTORDR1s = this.POTORDR1s_ds.slice(event.first, (event.first + event.rows));
            }
    }*/
}
