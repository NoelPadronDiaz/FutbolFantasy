import { Component, input } from '@angular/core';

export type IconName = 'edit' | 'sell' | 'delete' | 'restore';

@Component({
  selector: 'app-icon',
  imports: [],
  templateUrl: './icon.html',
})
export class Icon {
  readonly name = input.required<IconName>();
}
