import { Component, input, output } from '@angular/core';
import { SortDirection } from '../../utils/sort';

@Component({
  selector: 'th[appSortableHeader]',
  imports: [],
  templateUrl: './sortable-header.html',
})
export class SortableHeader {
  readonly field = input.required<string>();
  readonly activeField = input.required<string>();
  readonly direction = input.required<SortDirection>();
  readonly sortChange = output<string>();
}
