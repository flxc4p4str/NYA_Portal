import { Component, ElementRef, HostListener, trigger, state, transition, animate, style } from '@angular/core';
import { GlobalState } from '../../../global.state';
import { UserService } from '../../../user.service';
import { layoutSizes } from '../../../theme';
import { Message } from 'primeng/primeng';

@Component({
    selector: 'nga-inline-profile',
    templateUrl: './baInlineProfile.html',
    styleUrls: ['./baInlineProfile.scss'],
    animations: [
        trigger('menu', [
            state('hidden', style({
                height: '0px',
            })),
            state('visible', style({
                height: '*',
            })),
            transition('visible => hidden', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
            transition('hidden => visible', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
        ]),
    ],
})
export class BaInlineProfile {
    active: boolean;
    displayName: string;
    userId: string;

    msgs: Message[] = [];
    constructor(private _userService: UserService) {
        this._userService.myUserObject().subscribe(result => {
            this.displayName = result.userAccount.userName;
            this.userId = result.userAccount.userId;
        });


    }
    onClick(event) {
        this.active = !this.active;
        event.preventDefault();
    }
    refreshMenu() {
        this._userService.refreshMenu().subscribe(result => {
            // this.displayName = result.userAccount.userName;
            // this.userId = result.userAccount.userId;
        });

    }
}
