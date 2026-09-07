import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'euros' })
export class EurosPipe implements PipeTransform {
  transform(value: number | undefined | null): string {
    if (value === undefined || value === null || Number.isNaN(value)) {
      return '-';
    }
    return `${value.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} M€`;
  }
}
