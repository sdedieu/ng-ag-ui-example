import { Component, inject } from '@angular/core';
import {
  FormField,
  FormFieldInput,
  FormFieldLabel,
} from '../../shared/ui/form-field/form-field.component';
import { Field } from '@angular/forms/signals';
import { UserSettingsStateService } from './user-settings.state';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-user-settings',
  host: {
    class: 'flex flex-col items-center',
  },
  template: `
    <h1 class="mb-40 font-bold text-2xl">User Settings</h1>
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
          [field]="userSettingsForm.address.city"
        />
      </form-field>
      <form-field>
        <form-field-label label>ZipCode</form-field-label>
        <input
          form-field-input
          id="zipCode"
          type="zipCode"
          [field]="userSettingsForm.address.zipCode"
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
    {{ userSettingsForm.address.zipCode().errors() | json }}
  `,
  imports: [FormField, FormFieldLabel, FormFieldInput, Field, JsonPipe],
})
export class UserSettingsPage {
  private readonly userSettingsStateService = inject(UserSettingsStateService);

  readonly userSettingsForm = this.userSettingsStateService.form();
}
