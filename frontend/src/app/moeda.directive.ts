import { Directive, ElementRef, forwardRef, HostListener, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({selector:'input[formControlName="valorTotal"],input[formControlName="valorCompra"],input[formControlName="valorVenda"],input[formControlName="valor"],input[formControlName="saldoInicial"]',standalone:true,providers:[{provide:NG_VALUE_ACCESSOR,useExisting:forwardRef(()=>MoedaDirective),multi:true}]})
export class MoedaDirective implements ControlValueAccessor {
  private readonly elemento=inject(ElementRef<HTMLInputElement>).nativeElement;
  private valor:number|null=null; private alterar=(valor:number|null)=>{}; private tocar=()=>{};
  constructor(){this.elemento.type='text';this.elemento.inputMode='decimal';}
  writeValue(valor:number|null):void{this.valor=valor===null||valor===undefined?null:Number(valor);this.formatar();}
  registerOnChange(fn:(valor:number|null)=>void):void{this.alterar=fn;} registerOnTouched(fn:()=>void):void{this.tocar=fn;}
  setDisabledState(desabilitado:boolean):void{this.elemento.disabled=desabilitado;}
  @HostListener('focus') focar():void{this.elemento.value=this.valor===null?'':this.valor.toFixed(2).replace('.',',');}
  @HostListener('input',['$event.target.value']) digitar(texto:string):void{const limpo=texto.replace(/R\$|\s|\./g,'').replace(',','.').replace(/[^\d.-]/g,'');const numero=limpo===''?null:Number(limpo);this.valor=numero!==null&&Number.isFinite(numero)?numero:null;this.alterar(this.valor);}
  @HostListener('blur') sair():void{this.tocar();this.formatar();}
  private formatar():void{this.elemento.value=this.valor===null?'':this.valor.toLocaleString('pt-BR',{style:'currency',currency:'BRL',minimumFractionDigits:2,maximumFractionDigits:2});}
}
