import { Injectable } from '@angular/core';
import { GlobalState } from '../../../global.state';

@Injectable()
export class BaThemeSpinner {

  private _selector: string = 'preloader';

  private _element: HTMLElement;

  private _spinnerOffset: string = '0';

  constructor(private _state: GlobalState) {
    this._element = document.getElementById(this._selector);
    this._state.subscribe('menu.isCollapsed', (isCollapsed) => {
      this.centerSpinner(isCollapsed);
    });
  }

  show(styleOverides: any = { 'display': 'flex' }): void {
    // this._element.style['display'] = 'block';
    for (var [key, value] of (<any>Object).entries(styleOverides)) {
      this._element.style[key] = value;
    }
    this.centerSpinner(false);

  }

  hide(delay: number = 0): void {
    setTimeout(() => {
       this._element.style['display'] = 'none';
    }, delay);
  }

  centerSpinner(menuColapsed) {
    this._spinnerOffset = (menuColapsed) ? '0px' : '260px';
    this._element.style['left'] = this._spinnerOffset;
    this._element.style['padding-right'] = this._spinnerOffset;
  }
}
