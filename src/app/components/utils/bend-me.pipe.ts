import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'bendMe'})
export class BendMePipe implements PipeTransform {
  transform(skew: number, unit: number): string {
    return `transform: skew(${skew}deg) translateX(${unit}px)`
  }
}