import { Injectable }  from '@angular/core';
import { HttpClient }  from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}
  get<T>(path: string)              { return this.http.get<T>(`/api/v1${path}`); }
  post<T>(path: string, body: any)  { return this.http.post<T>(`/api/v1${path}`, body); }
  put<T>(path: string, body: any)   { return this.http.put<T>(`/api/v1${path}`, body); }
  patch<T>(path: string, body: any) { return this.http.patch<T>(`/api/v1${path}`, body); }
  delete<T>(path: string)           { return this.http.delete<T>(`/api/v1${path}`); }
  upload<T>(path: string, form: FormData) { return this.http.post<T>(`/api/v1${path}`, form); }
}
