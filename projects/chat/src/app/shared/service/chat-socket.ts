import { InjectionToken } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

export const CHAT_SOCKET = new InjectionToken<Socket>('CHAT_SOCKET', {
  providedIn: 'root',
  factory: () => io(environment.apiUrl),
});

