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
import { ToolService } from './features/chat/tool.service';
import { ChatStateService } from './shared/service/chat-state.service';
import { registerAppTools } from './features/chat/tools';
import { provideMarkdown } from 'ngx-markdown';

export const appConfig: ApplicationConfig = {
  providers: [
    provideMarkdown(),
    ToolService,
    provideAppInitializer(registerAppTools),
    ChatStateService,
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiInterceptor])),
    { provide: ApiService, useClass: ApiService },
  ],
};
