import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppTranslationModule } from '../../app.translation.module';
import { NgaModule } from '../../theme/nga.module';

import { PurchaseOrdersComponent } from './purchaseOrders.component';
import { routing } from './purchaseOrders.routing';
import {DataTableModule} from 'primeng/primeng';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AppTranslationModule,
    NgaModule,
    routing,
    DataTableModule,
  ],
  declarations: [
    PurchaseOrdersComponent,
  ],
})
export class PurchaseOrdersModule { }
