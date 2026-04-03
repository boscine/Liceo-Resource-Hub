import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();
    
    // Debugging logs to help identify what's going wrong
    console.log(`[JwtInterceptor] Intercepting request to: ${req.url}`);
    if (token) {
      console.log(`[JwtInterceptor] Token found, attaching to Authorization header.`);
      req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    } else {
      console.warn(`[JwtInterceptor] NO TOKEN FOUND in localStorage. Request will be sent without Authorization header!`);
    }

    return next.handle(req);
  }
}
