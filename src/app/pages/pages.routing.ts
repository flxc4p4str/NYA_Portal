import { Routes, RouterModule } from '@angular/router';
import { Pages } from './pages.component';
import { ModuleWithProviders } from '@angular/core';
// noinspection TypeScriptValidateTypes

// export function loadChildren(path) { return System.import(path); };

// DROP TABLE WBTMENU1;
// Create Table WBTMENU1 (
// WEB_MENU_ID VARCHAR2(20),
// WEB_MENU_DESC VARCHAR2(55),
// WEB_MODULE_ID VARCHAR2(20),
// SECURITY_CODE VARCHAR2(6),
// MENU_ITEM_SEQ NUMBER(2),
// Primary Key (WEB_MENU_ID));


// INSERT INTO WBTMENU1 VALUES ('ports','Ports','PortsModule','WB1',1);
// INSERT INTO WBTMENU1 VALUES ('purchaseOrders','Purchase Orders','PurchaseOrderModule','WB2',10);
// INSERT INTO WBTMENU1 VALUES ('ucc','UCC 128 Labels','UccModule','WB3',20);
export const routes: Routes = [
  {
    path: 'login',
    loadChildren: 'app/pages/login/login.module#LoginModule',
  },
  {
    path: 'register',
    loadChildren: 'app/pages/register/register.module#RegisterModule',
  },
  {
    path: 'pages',
    component: Pages,
    children: [
      { path: '', redirectTo: 'purchaseOrders', pathMatch: 'full' },
      { path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardModule' },
      { path: 'forecast', loadChildren: './forecast/forecast.module#ForecastModule' },
      { path: 'ports', loadChildren: './ports/ports.module#PortsModule' },
      { path: 'logistics', loadChildren: './logistics/logistics.module#LogisticsModule' },
      { path: 'purchaseOrders', loadChildren: './purchaseOrders/purchaseOrders.module#PurchaseOrdersModule' },
      { path: 'ucc', loadChildren: './ucc/ucc.module#UccModule' },
    ],
  },
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
