import { Directive, ElementRef, inject } from '@angular/core';

@Directive({selector:'input[type="date"]',standalone:true})
export class AnoQuatroDirective {
  private readonly elemento=inject(ElementRef<HTMLInputElement>).nativeElement;
  constructor(){this.elemento.min=this.elemento.min||'1000-01-01';this.elemento.max=this.elemento.max||'9999-12-31';}
}
