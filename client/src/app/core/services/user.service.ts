import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = environment.api;

    constructor(private http: HttpClient) { }

    getProfile(): Observable<any> {
        return this.http.get(`${this.apiUrl}/api/user/profile`);
    }

    updateProfile(profileData: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/api/user/profile`, profileData);
    }

    changePassword(passwordData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/api/user/change-password`, passwordData);
    }
} 