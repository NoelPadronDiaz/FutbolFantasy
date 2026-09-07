import { Component, ElementRef, HostListener, computed, forwardRef, inject, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LALIGA_TEAMS, Team } from '../../models/team.model';

@Component({
  selector: 'app-team-select',
  imports: [],
  templateUrl: './team-select.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TeamSelect),
      multi: true,
    },
  ],
})
export class TeamSelect implements ControlValueAccessor {
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly teams = LALIGA_TEAMS;
  readonly open = signal(false);
  readonly value = signal<string | undefined>(undefined);
  readonly disabled = signal(false);

  readonly selectedTeam = computed(() => this.teams.find((t) => t.name === this.value()));

  private onChange: (value: string | undefined) => void = () => {};
  private onTouched: () => void = () => {};

  toggle(): void {
    if (this.disabled()) {
      return;
    }
    this.open.update((v) => !v);
  }

  select(team: Team | undefined): void {
    this.value.set(team?.name);
    this.onChange(team?.name);
    this.onTouched();
    this.open.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  writeValue(value: string | undefined): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: string | undefined) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
