import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export function apiInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  // ✅ Skip if already absolute URL
  if (req.url.startsWith('http')) {
    return next(req);
  }

  // ✅ Prefix with environment API URL
  const apiReq = req.clone({
    url: `${environment.apiUrl}${req.url}`,
  });

  return next(apiReq);
}
