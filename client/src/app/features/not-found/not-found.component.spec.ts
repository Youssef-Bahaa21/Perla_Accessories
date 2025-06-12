import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NotFoundComponent } from './not-found.component';
import { SeoService } from '../../core/services/seo.service';

describe('NotFoundComponent', () => {
    let component: NotFoundComponent;
    let fixture: ComponentFixture<NotFoundComponent>;
    let routerSpy: jasmine.Spy;
    let seoServiceSpy: jasmine.SpyObj<SeoService>;

    beforeEach(async () => {
        const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
        const seoSpy = jasmine.createSpyObj('SeoService', ['updateSEO']);

        await TestBed.configureTestingModule({
            imports: [NotFoundComponent],
            providers: [
                { provide: Router, useValue: routerSpyObj },
                { provide: SeoService, useValue: seoSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(NotFoundComponent);
        component = fixture.componentInstance;
        routerSpy = TestBed.inject(Router).navigate as jasmine.Spy;
        seoServiceSpy = TestBed.inject(SeoService) as jasmine.SpyObj<SeoService>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set SEO data on init', () => {
        component.ngOnInit();
        expect(seoServiceSpy.updateSEO).toHaveBeenCalled();
    });

    it('should navigate to home when goHome is called', () => {
        component.goHome();
        expect(routerSpy).toHaveBeenCalledWith(['/']);
    });

    it('should navigate to products when goToProducts is called', () => {
        component.goToProducts();
        expect(routerSpy).toHaveBeenCalledWith(['/products']);
    });

    it('should call window.history.back when goBack is called', () => {
        spyOn(window.history, 'back');
        component.goBack();
        expect(window.history.back).toHaveBeenCalled();
    });
}); 