import { Component, OnInit } from '@angular/core';
import { Routes } from '@angular/router';

import { BaMenuService } from '../theme';
import { PAGES_MENU } from './pages.menu';
import { UserService } from '../user.service';

// to add breadcrumb
//         <ba-content-top></ba-content-top>

@Component({
  selector: 'pages',
  template: `
    <ba-sidebar></ba-sidebar>
    <ba-page-top></ba-page-top>
    <div class="al-main">
      <div class="al-content">
        <router-outlet></router-outlet>
      </div>
    </div>
    <footer class="al-footer clearfix">
      <div class="al-footer-main clearfix">
        <div class="al-copy">&copy; <a href="http://absolution.com" translate>{{'general.abs'}}</a> 2017</div>
      </div>
    </footer>
    <ba-back-top position="200"></ba-back-top>
    `
})
export class Pages implements OnInit {
  menu: any[];
  constructor(private _menuService: BaMenuService, private _userService: UserService) {
  }

  ngOnInit() {
    this.buildMenu();

  }

  buildMenu() {
    this.menu = PAGES_MENU;
    this._menuService.updateMenuByRoutes(<Routes>this.menu);
    this._userService.myUserObject().subscribe(result => {
      const userMenu = result.userMenu.sort(function (a, b) { return a.menuItemSeq - b.menuItemSeq; });
      let menuItemSelected = true;
      for (const menuItem of userMenu) {
        const umi = {
          path: menuItem.webMenuId,
          data: {
            menu: {
              title: menuItem.webMenuDesc,
              icon: menuItem.menuItemIcon,
              selected: menuItemSelected,
              expanded: false,
              order: menuItem.menuItemSeq,
              css: menuItem.menuItemCss,
            },
          },
        };
        if (menuItemSelected) {
          menuItemSelected = false;
        }
        this.menu[0]['children'].push(umi);
      }
      this._menuService.updateMenuByRoutes(<Routes>this.menu);
    });
  }
}
