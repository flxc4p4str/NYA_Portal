import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Http, Headers } from '@angular/http';
import { Router } from '@angular/router';
import { UserService } from '../../user.service';
import {ToastyService, ToastyConfig, ToastOptions, ToastData} from 'ng2-toasty';

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
authMsg: string = '';
  constructor(fb: FormBuilder, private http: Http, private router: Router
    , private _userService: UserService, private _msg: ToastyService) {
    this.form = fb.group({
      'username': ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
    });

    this.username = this.form.controls['username'];
    this.password = this.form.controls['password'];
  }
  autoFillForm() {
    const x = location.hostname;
    if (x === 'localhost') {
      this.form.patchValue({ username: 'rdw' });
      this.form.patchValue({ password: '0ff1c3' });
      this.onSubmit(this.form.value);
    }
  }
  keyDownFunction(event, values: Object) {
    if (event.keyCode == 13) {
      this.onSubmit(values);
      // rest of your code
    }
  }
  onSubmit(values: Object): void {
    this.submitting = true;
    this.authMsg = '';
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
      messageHeaders.append('Authorization', `Basic ${encodedClientIdAndSecret}`);

      this._userService.authenticateUser(this.username.value, this.password.value)
        .subscribe(result => {
          if (result.valid) {
            this.saveToken(result.apiKey);
            this.submitted = true;
          } else {
            // this.authMsg = `Invalid Credentials`;
            this._msg.error(`Invalid Credentials`);
            this.submitting = false;
          }
        });


      // this.http.post(authGlobals.tokenEndpoint, dataForBody, {
      //   headers: messageHeaders,
      // })
      //   .map(res => res.json())
      //   .subscribe(
      //   (data) => {
      //     this.saveToken(data.access_token);
      //     this.submitted = true;
      //   },
      //   );
      // this.saveToken('fake_token');
      // this.submitted = true;


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
    localStorage['apiKey'] = token;
    this._userService.getUserInstance(this.username.value).subscribe(result => {
      this._msg.success(`Welcome back ${result.userAccount.userName}`);
      this.router.navigate(['pages/purchaseOrders', {}]);
    });
  }

    // addToast() {
    //     // Just add default Toast with title only
        
    //     // Or create the instance of ToastOptions
    //     var toastOptions:ToastOptions = {
    //         title: "My title",
    //         msg: "The message",
    //         showClose: true,
    //         timeout: 5000,
    //         theme: 'default',
    //         onAdd: (toast:ToastData) => {
    //             console.log('Toast ' + toast.id + ' has been added!');
    //         },
    //         onRemove: function(toast:ToastData) {
    //             console.log('Toast ' + toast.id + ' has been removed!');
    //         }
    //     };
    //     // Add see all possible types in one shot
    //     this.toastyService.info(toastOptions);
    //     this.toastyService.success(toastOptions);
    //     this.toastyService.wait(toastOptions);
    //     this.toastyService.error(toastOptions);
    //     this.toastyService.warning(toastOptions);
    // }


}
