import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppTranslationModule } from '../../app.translation.module';
import { NgaModule } from '../../theme/nga.module';

import { LogisticsComponent } from './logistics.component';
import { routing } from './logistics.routing';
import { ElementOverlayDirective } from './../../elementOverlay.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AppTranslationModule,
    NgaModule,
    routing,
  ],
  declarations: [
    LogisticsComponent,
  ],
})
export class LogisticsModule { }
