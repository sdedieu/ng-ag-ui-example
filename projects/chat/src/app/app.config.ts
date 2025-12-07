import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { apiInterceptor } from './shared/interceptors/api.interceptor';
import { ApiService } from './shared/service/api.service';
import { ApiServiceMock } from './shared/service/api.service.mock';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiInterceptor])),
    { provide: ApiService, useClass: ApiServiceMock },
  ],
};
