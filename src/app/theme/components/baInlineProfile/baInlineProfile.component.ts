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
            transition('hidden => visible', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
        ]),
    ],
})
export class BaInlineProfile {
    active: boolean;
    settingsActive: boolean;
    warehouseActive: boolean;
    displayName: string;
    userId: string;
    whseList: any[];
    showProfileSettings: boolean;
    showWarehouseSettings: boolean;
    whseListHeading: string;
    msgs: Message[] = [];
    constructor(private _userService: UserService) {
        this._userService.myUserObject().subscribe(result => {
            this.displayName = result.userAccount.userName;
            this.userId = result.userAccount.userId;
            this.whseList = result.userSettings.whseList;
            this.whseListHeading = (this.whseList.length === 1) ? 'Warehouse' : 'Warehouse List';
            this.showWarehouseSettings = (this.whseList.length >= 1);
            this.showProfileSettings = this.showWarehouseSettings; // || some other profile setting
        });
    }
    onClick(event) {
        this.active = !this.active;
        if (!this.active) {
            this.settingsActive = false;
            this.warehouseActive = false;
        }
        event.preventDefault();
    }
    onClickSettings(event) {
        this.settingsActive = !this.settingsActive;
        event.preventDefault();
    }

    onClickWarehouse(event) {
        this.warehouseActive = !this.warehouseActive;
        event.preventDefault();
    }
    refreshMenu() {
        this._userService.refreshMenu().subscribe(result => {
            // this.displayName = result.userAccount.userName;
            // this.userId = result.userAccount.userId;
        });

    }
}
