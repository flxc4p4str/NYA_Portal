import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
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
import { Router, Routes, Route } from '@angular/router';
import { HttpClientService } from './http-client';
import * as authGlobals from './auth.globals';


@Injectable()
export class DataService {
    result: Object[];
    POTORDR1s: any[];
    POTORDR2s: any[];
    constructor(private http: HttpClientService) { }
    getForcastData(): Observable<any> {
        let api = authGlobals.apiBase + 'api/NYA/GetPOForcast';
        return this.http
            .get(api)
            .map(response => {
                if (response.status === 400) {
                    return 'FAILURE';
                } else if (response.status === 200) {
                    console.info('Forcast Data: ', response.json());
                    return response.json();
                }
            },
        ).catch(this.handleError);
    }

    getOpenPOs(): Observable<any> {
        let api = authGlobals.apiBase + 'api/NYA/OpenPOs';
        return this.http
            .post(api, {})
            .map(response => {
                if (response.status === 400) {
                    return 'FAILURE';
                } else if (response.status === 200) {
                    this.POTORDR1s = response.json().potordr1s;
                    return this.POTORDR1s;
                }
            },
        ).share()
            .catch(this.handleError);
    }
    getOpenPOsByPort(): Observable<any> {
        let api = authGlobals.apiBase + 'api/NYA/OpenPOsByPort';
        return this.http
            .post(api, {})
            .map(response => {
                if (response.status === 400) {
                    return 'FAILURE';
                } else if (response.status === 200) {
                    return response.json();
                }
            },
        ).share()
            .catch(this.handleError);
    }

    getPO(poOrderNo): Observable<any> {
        let api = authGlobals.apiBase + 'api/NYA/ViewPO';
        return this.http
            .post(api, { 'poOrderNo': poOrderNo })
            .map(response => {
                if (response.status === 400) {
                    return 'FAILURE';
                } else if (response.status === 200) {
                    this.POTORDR2s = response.json().potordr2s;
                    return this.POTORDR2s;
                }
            },
        ).share()
            .catch(this.handleError);
    }

    private handleError(error: Response) {
        console.error(error);
        let msg = `Error status code ${error.status} at ${error.url}`;
        return Observable.throw(msg);
    }
}



