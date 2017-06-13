import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './pages.routing';
import { NgaModule } from '../theme/nga.module';
import { AppTranslationModule } from '../app.translation.module';
import { ButtonModule } from 'primeng/primeng';
import { Pages } from './pages.component';

@NgModule({
  imports: [CommonModule, AppTranslationModule, NgaModule, ButtonModule, routing],
  declarations: [Pages],
  exports:[ButtonModule]
})
export class PagesModule {
}
