import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SearchService {
    private searchQuerySubject = new BehaviorSubject<string>('');
    private clearFiltersSubject = new BehaviorSubject<boolean>(false);

    // Observable for search query changes
    searchQuery$ = this.searchQuerySubject.asObservable();

    // Observable for clear filters trigger
    clearFilters$ = this.clearFiltersSubject.asObservable();

    // Update search query
    updateSearchQuery(query: string): void {
        this.searchQuerySubject.next(query);
    }

    // Get current search query
    getCurrentSearchQuery(): string {
        return this.searchQuerySubject.value;
    }

    // Trigger clear filters when search is empty
    triggerClearFilters(): void {
        this.clearFiltersSubject.next(true);
    }

    // Reset clear filters trigger
    resetClearFilters(): void {
        this.clearFiltersSubject.next(false);
    }
} 