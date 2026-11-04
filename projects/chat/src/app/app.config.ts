import {
  ApplicationConfig,
  /**  --- step 2 code start --- */
  provideAppInitializer,
  /**  --- step 2 code end --- */
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { apiInterceptor } from './shared/interceptors/api.interceptor';
import { ApiService } from './shared/service/api.service';
/**  --- step 2 code start --- */
import { ToolService } from './features/chat/tool.service';
/**  --- step 2 code end --- */
/**  --- step 3 code start --- */
import { ChatStateService } from './shared/service/chat-state.service';
/**  --- step 3 code end --- */
/**  --- step 2 code start --- */
import { registerAppTools } from './features/chat/tools';
/**  --- step 2 code end --- */

export const appConfig: ApplicationConfig = {
  providers: [
    /**  --- step 2 code start --- */
    ToolService,
    provideAppInitializer(registerAppTools),
    /**  --- step 2 code end --- */
    /**  --- step 3 code start --- */
    ChatStateService,
    /**  --- step 3 code end --- */
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiInterceptor])),
    { provide: ApiService, useClass: ApiService },
  ],
};
