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
    private _obsUser: Observable<any>;
    constructor(private http: HttpClientService) {
        this._userID = localStorage['user_name'];
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

    private handleError(error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'Server Error');
    }
}
