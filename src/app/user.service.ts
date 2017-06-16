import { PAGES_MENU } from './pages/pages.menu';
import { Routes } from '@angular/router';
import { BaMenuService } from './theme';
import { GlobalState } from './global.state';

import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions } from '@angular/http';
import { HttpClientService } from './http-client';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/throw';
import * as authGlobals from './auth.globals';

@Injectable()
export class UserService {
    private _userID: String;
    private _userObject: Object;
    private _obsAuth: Observable<any>;
    private _obsUser: Observable<any>;
    private _obsMenu: Observable<any>;
    constructor(private http: HttpClientService, private _menuService: BaMenuService, private _state: GlobalState) {
        this._userID = localStorage['user_name'];
    }

    authenticateUser(user, pass): Observable<any> {

        var api = authGlobals.apiBase + 'api/ABS/Authenticate';
        this._obsAuth = this.http
            .post(api, { 'user': user, 'pass': pass })
            .map(response => {
                this._obsAuth = null;
                const resp = response.json();
                if (resp.status === 401) {
                    return { 'valid': false, apiKey: '' };
                } else if (resp.status === 200) {
                    return { 'valid': true, apiKey: resp.apiKey };
                }
            },
        ).share()
            .catch(this.handleError);
        return this._obsAuth;
    }

    getUserInstance(userID): Observable<any> {
        this._userID = userID || localStorage['user_name'];
        var api = authGlobals.apiBase + 'api/ABS/UserProfile';
        if (this._userObject) {
            return Observable.of(this._userObject);
        } else if (this._obsUser) {
            return this._obsUser;
        } else {
            this._obsUser = this.http
                .post(api, { user: userID })
                .map(response => {
                    this._obsUser = null;
                    if (response.status === 400) {
                        return 'FAILURE';
                    } else if (response.status === 200) {
                        this._userObject = response.json();
                        return this._userObject;
                    }
                },
            ).share()
                .catch(this.handleError);
            return this._obsUser;
        }
    }
    myUserObject(): Observable<any> {
        if (this._userObject) {
            return Observable.of(this._userObject);
        } else {
            return this.getUserInstance(localStorage['user_name']);
        }
    }
    refreshMenu(): Observable<any> {

        var api = authGlobals.apiBase + 'api/ABS/UserProfile';
        this._obsMenu = this.http
            .post(api, { user: this._userID })
            .map(response => {
                if (response.status === 400) {
                    return 'FAILURE';
                } else if (response.status === 200) {
                    // this._state.notifyDataChanged('menu.clear', {});
                    const newMenu = [
                        {
                            path: 'pages',
                            children: [
                            ],
                        },
                    ];
                    this._menuService.updateMenuByRoutes(<Routes>newMenu);

                    const userMenu = response.json().userMenu;

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
                        newMenu[0]['children'].push(umi);
                    }
                    this._menuService.updateMenuByRoutes(<Routes>newMenu);
                    return newMenu;
                }
            },
        ).share()
            .catch(this.handleError);
        return this._obsMenu;
    }
    private handleError(error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'Server Error');
    }
}
