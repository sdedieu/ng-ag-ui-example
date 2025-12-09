import { computed, Injectable, signal } from '@angular/core';
import { GenricFormStateService } from '../../shared/service/generic-form-state.service';
import {
  email,
  required,
  SchemaPathTree,
  validate,
} from '@angular/forms/signals';

interface Address {
  city: string;
  zipCode: string;
}

interface UserState {
  firstname: string;
  lastname: string;
  address: Address;
  email: string;
  password: string;
}

const defaultState: UserState = {
  firstname: 'Sylvain',
  lastname: 'Dedieu',
  address: {
    city: 'Grenoble',
    zipCode: '38000',
  },
  email: 's.dedieu@criteo.com',
  password: 'in_your_dream',
};

@Injectable({
  providedIn: 'root',
})
export class UserSettingsStateService extends GenricFormStateService<UserState> {
  protected override readonly _state = signal(defaultState);

  zipCodeValidator = computed(() => {
    const zipCode = this.state().address.zipCode;
    if (!zipCode.startsWith('38')) {
      return {
        kind: 'IsereOnly',
        message: 'ZipCode must start with 38',
      };
    }
    return null;
  });

  protected override readonly schemaOrOptions = (
    schemaPath: SchemaPathTree<UserState>
  ) => {
    required(schemaPath.email, { message: 'Email is required' });
    email(schemaPath.email, { message: 'Enter a valid email address' });
    validate(schemaPath.address.zipCode, this.zipCodeValidator);
  };
}
