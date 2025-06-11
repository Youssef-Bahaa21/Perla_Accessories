import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment as env } from '../../../environments/environment';   // ← correct path for Angular CLI

export interface PagedResponse<T> {
    data: T[];
    page: number;
    limit: number;
    total: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
    constructor(private http: HttpClient) { }

    /**
     * Call the paginated API:
     *   /api/products?page=<page>&limit=<limit>
     */
    getProducts<T>(page = 1, limit = 20): Observable<PagedResponse<T>> {
        const params = new HttpParams()
            .set('page', String(page))
            .set('limit', String(limit));

        return this.http.get<PagedResponse<T>>(
            `${env.api}/api/products`,
            { params },
        );
    }
}
