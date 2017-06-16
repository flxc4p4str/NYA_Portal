
import {Injectable} from '@angular/core';
import {Http, Headers, ResponseContentType} from '@angular/http';
import {Router }  from '@angular/router';

@Injectable()
export class HttpClientService {

  constructor(private http: Http, private router: Router) {
      this.router = router;
  }

  createAuthorizationHeader(headers: Headers) {
    const authToken = this.getToken();
    headers.append('Authorization', `Bearer ${authToken}`); 
    headers.append('apiKey', authToken); 
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
  postForBlob(url, data) {
      if (url.indexOf("/api/") >= 0){
        let headers = new Headers();
        this.createAuthorizationHeader(headers);
        return this.http.post(url, data, {
        headers: headers,
        responseType: ResponseContentType.Blob,
        });
      }
    return this.http.post(url, data, {});      
  }
  container(){
    return {token: localStorage["apiKey"]}
    }

  getToken(){
    if (this.container().token == null){
        if (localStorage.getItem("apiKey") == null){
            this.router.navigate(["#/login",{}]);
        } else {
            this.setToken(localStorage["apiKey"]);
        }
    }
    return this.container().token;
  }
  setToken(token){
    this.container().token = token;
  }

}