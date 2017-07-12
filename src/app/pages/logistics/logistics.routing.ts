import { Routes, RouterModule } from '@angular/router';

import { LogisticsComponent } from './logistics.component';
import { ModuleWithProviders } from '@angular/core';

// noinspection TypeScriptValidateTypes
export const routes: Routes = [
  {
    path: '',
    component: LogisticsComponent,
    children: [
      // { path: 'treeview', component: TreeViewComponent }
    ],
  },
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
