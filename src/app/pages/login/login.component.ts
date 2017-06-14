import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Http, Headers } from '@angular/http';
import { Router } from '@angular/router';
import { UserService } from '../../user.service';

import * as authGlobals from '../../auth.globals';

@Component({
  selector: 'nga-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent implements OnInit {

  form: FormGroup;
  username: AbstractControl;
  password: AbstractControl;
  submitted: boolean = false;
  submitting: boolean = false;

  constructor(fb: FormBuilder, private http: Http, private router: Router
    , private _userService: UserService) {
    this.form = fb.group({
      'username': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(4)])]
    });

    this.username = this.form.controls['username'];
    this.password = this.form.controls['password'];
  }
  autoFillForm() {
    this.form.patchValue({ username: 'rdw' });
    this.form.patchValue({ password: '0ff1c3RDW' });
    this.onSubmit(this.form.value);
  }
  keyDownFunction(event, values: Object) {
    if (event.keyCode == 13) {
      this.onSubmit(values);
      // rest of your code
    }
  }
  onSubmit(values: Object): void {
    this.submitting = true;
    if (this.form.valid) {
      const bo = {
        un: encodeURI(values['username']),
        pw: encodeURI(values['password']),
        scope: encodeURI(values['absdeveloper'])
      };

      const dataForBody = "grant_type=password&" +
        "username=" + encodeURI(values["username"]) + "&" +
        "password=" + encodeURI(values["password"]) + "&" +
        "scope=" + encodeURI("absdeveloper");

      const encodedClientIdAndSecret = btoa('absROPC:Th1s1sMyR4nd0mCl13ntS3cr3t!');
      const messageHeaders = new Headers();
      messageHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
      messageHeaders.append('Authorization', 'Basic ' + encodedClientIdAndSecret)

      this.saveToken('fake_token');
      this.submitted = true;


      /*      this.http.post(authGlobals.tokenEndpoint, dataForBody, {
              headers: messageHeaders,
            })
              .map(res => res.json())
              .subscribe(
              (data) => {
                this.saveToken(data.access_token);
                this.submitted = true;
              },
              );*/
    }
  }
  ngOnInit() {
    localStorage.clear();
    this.submitting = false;
  }
  saveToken(token) {
    localStorage['user_name'] = this.username.value;
    localStorage['access_token'] = token;
    this._userService.getUserInstance(this.username.value).subscribe(result => {
      console.info('Authentication Success', 'Welcome back ' + result.userAccount.userName);

      this.router.navigate(['pages/purchaseOrders', {}]);
    });
  }
}
