import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';
import {Router }  from '@angular/router';

@Injectable()
export class HttpClientService {

  constructor(private http: Http, private router: Router) {
      this.router = router;
  }

  createAuthorizationHeader(headers: Headers) {
    var authToken = this.getToken();
    headers.append('Authorization', 'Bearer ' + authToken); 
  }

  get(url) {
      if (url.indexOf("/api/") >= 0){
        let headers = new Headers();
        this.createAuthorizationHeader(headers);
        return this.http.get(url, {
        headers: headers
        });
      }
    return this.http.get(url, {});
  }

  post(url, data) {
      if (url.indexOf("/api/") >= 0){
        let headers = new Headers();
        this.createAuthorizationHeader(headers);
        return this.http.post(url, data, {
        headers: headers
        });
      }
    return this.http.post(url, data, {});      
  }

  container(){
    return {token: localStorage["access_token"]}
    }

  getToken(){
    if (this.container().token == null){
        if (localStorage.getItem("access_token") == null){
            this.router.navigate(["#/login",{}]);
        } else {
            this.setToken(localStorage["access_token"]);
        }
    }
    return this.container().token;
  }
  setToken(token){
    this.container().token = token;
  }

}