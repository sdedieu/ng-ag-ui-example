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
import { Field } from '@angular/forms/signals';
import { UserStateService } from './user.state';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../shared/ui/card/card.component';
import { UpperCasePipe } from '@angular/common';

@Directive({
  selector: 'form',
})
export class FormDirective {}

@Component({
  selector: 'app-user-settings',
  host: {
    class: 'block w-full min-w-0 max-w-5xl mx-4',
  },
  template: `
    <card>
      <card-header>
        <p card-description>
          {{ 'Edit your user informations' | uppercase }}
        </p>
        <h1 card-title>User Settings</h1>
      </card-header>
      <card-content>
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
      </card-content>
    </card>
  `,
  imports: [
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
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
