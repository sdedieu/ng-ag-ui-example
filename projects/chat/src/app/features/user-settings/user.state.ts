import { Injectable, signal } from '@angular/core';
import { GenricFormStateService } from '../../shared/service/generic-form-state.service';

interface Adress {
  city: string;
  zipCode: string;
}

interface UserState {
  firstname: string;
  lastname: string;
  adress: Adress;
  email: string;
  password: string;
}

const defaultState: UserState = {
  firstname: 'Sylvain',
  lastname: 'Dedieu',
  adress: {
    city: 'Grenoble',
    zipCode: '38000',
  },
  email: 's.dedieu@criteo.com',
  password: 'in_your_dream',
};

@Injectable({
  providedIn: 'root',
})
export class UserStateService extends GenricFormStateService<UserState> {
  protected override readonly _state = signal(defaultState);
}
