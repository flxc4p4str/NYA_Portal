import { Directive, ElementRef, Input, OnChanges } from '@angular/core';

@Directive({ selector: '[ngaElementOverlay]' })
export class ElementOverlayDirective implements OnChanges {

    @Input() ngaElementOverlay: boolean;
    private elRef: ElementRef;

    constructor(el: ElementRef) {
        this.elRef = el;
        el.nativeElement.style.position = 'relative';
    }
    ngOnChanges(changes) {
        this.toggleOverlay(changes.ngaElementOverlay.currentValue);
    }
    toggleOverlay(showOverlay) {
        if (showOverlay) {
            this.elRef.nativeElement.insertAdjacentHTML('beforeend', '<div class="elementOverlay"></div>');
        } else {
            const overlayElement = this.elRef.nativeElement.getElementsByClassName('elementOverlay')[0];
            if (overlayElement) {
                overlayElement.remove();
            }
        }
    }
}
