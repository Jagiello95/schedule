import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'snapMe'})
export class SnapMePipe implements PipeTransform {
  transform(num:number, unit: number, min: number, max: number, draggedWidth: number): string {
    if (num > max - min - draggedWidth) {
      return max - min - draggedWidth + 'px'
    }

    if (num < 0) {
      return 0 + 'px'
    }
    return (Math.round(num/unit) * unit) + 'px'
  }
}