import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  inject,
} from '@angular/core';
import {
  FormField,
  FormFieldInput,
  FormFieldLabel,
} from '../../shared/ui/form-field/form-field.component';
import { Field, form } from '@angular/forms/signals';
import { UserStateService } from './user.state';
import { Card } from '../../shared/ui/card/card.component';
import { UpperCasePipe } from '@angular/common';

@Directive({
  selector: 'form',
})
export class FormDirective {}

@Component({
  selector: 'app-user-settings',
  host: {
    class: 'flex flex-col items-center',
  },
  template: `
    <card>
      <p
        class="mb-2 text-xs font-extrabold tracking-widest text-emerald-700 uppercase"
      >
        {{ 'Edit your user informations' | uppercase }}
      </p>
      <h1 class="mb-20 font-bold text-6xl">User Settings</h1>
      <form class="flex flex-col items-center gap-6">
        <form-field>
          <form-field-label>Firstname</form-field-label>
          <input
            form-field-input
            id="firstname"
            type="text"
            [field]="userSettingsForm.firstname"
          />
        </form-field>
        <form-field>
          <form-field-label label>Lastname</form-field-label>
          <input
            form-field-input
            id="firstname"
            type="text"
            [field]="userSettingsForm.lastname"
          />
        </form-field>
        <form-field>
          <form-field-label label>City</form-field-label>
          <input
            form-field-input
            id="city"
            type="city"
            [field]="userSettingsForm.adress.city"
          />
        </form-field>
        <form-field>
          <form-field-label label>ZipCode</form-field-label>
          <input
            form-field-input
            id="zipCode"
            type="zipCode"
            [field]="userSettingsForm.adress.zipCode"
          />
        </form-field>
        <form-field>
          <form-field-label label>Email</form-field-label>
          <input
            form-field-input
            id="email"
            type="email"
            [field]="userSettingsForm.email"
          />
        </form-field>
        <form-field>
          <form-field-label label>Password</form-field-label>
          <input
            form-field-input
            id="password"
            type="password"
            [field]="userSettingsForm.password"
          />
        </form-field>
      </form>
    </card>
  `,
  imports: [
    Card,
    FormField,
    FormFieldLabel,
    FormFieldInput,
    Field,
    UpperCasePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSettingsPage {
  private readonly userStateService = inject(UserStateService);

  userSettingsForm = this.userStateService.form();
}
