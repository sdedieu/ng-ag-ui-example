import {
  ChangeDetectionStrategy,
  Component,
  computed,
  Directive,
  inject,
} from '@angular/core';
import {
  FormField,
  FormFieldInput,
  FormFieldLabel,
} from '../../shared/ui/form-field/form-field.component';
import { email, Field, required } from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';
import { UserStateService } from './user.state';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../shared/ui/card/card.component';
import { UpperCasePipe } from '@angular/common';
import { Button } from '../../shared/ui/button/button';

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
        <form class="flex flex-col items-center gap-6" (ngSubmit)="submit()">
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
          @if (hasChanges()) {
            <button
              type="submit"
              color="primary"
              [disabled]="!userSettingsForm().valid()"
            >
              Save changes
            </button>
          }
        </form>
      </card-content>
    </card>
  `,
  imports: [
    Button,
    FormsModule,
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

  readonly userSettingsForm = this.userStateService.form((path) => {
    required(path.firstname);
    required(path.lastname);
    required(path.adress.city);
    required(path.adress.zipCode);
    required(path.email);
    email(path.email);
    required(path.password);
  });

  readonly hasChanges = computed(
    () =>
      !this.userStateService.equal(
        this.userSettingsForm().value(),
        this.userStateService.lastSubmittedState(),
      ),
  );

  submit(): void {
    if (!this.hasChanges() || !this.userSettingsForm().valid()) return;

    this.userStateService.submit(this.userSettingsForm().value());
  }
}
