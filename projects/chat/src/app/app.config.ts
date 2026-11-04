import {
  ApplicationConfig,

  provideAppInitializer,

  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { apiInterceptor } from './shared/interceptors/api.interceptor';
import { ApiService } from './shared/service/api.service';
import { provideMarkdown } from 'ngx-markdown';

import { ToolService } from './features/chat/tool.service';

import { registerAppTools } from './features/chat/tools';

export const appConfig: ApplicationConfig = {
  providers: [
    provideMarkdown(),

    ToolService,
    provideAppInitializer(registerAppTools),

    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiInterceptor])),
    { provide: ApiService, useClass: ApiService },
  ],
};
