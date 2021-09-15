import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'snapMe'})
export class SnapMePipe implements PipeTransform {
  transform(value: string, unit: number): string {
    const num = +value.substring(0, value.length-2)

    return (Math.round(num/unit) * unit) + 'px'
  }
}