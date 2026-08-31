import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageFrame } from './page-frame';

describe('PageFrame', () => {
  let component: PageFrame;
  let fixture: ComponentFixture<PageFrame>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageFrame],
    }).compileComponents();

    fixture = TestBed.createComponent(PageFrame);
    fixture.componentRef.setInput('title', 'Apps');
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Apps');
  });

  it('should render a home link when homeHref is set', async () => {
    fixture.componentRef.setInput('homeHref', '/');
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('a.page-frame__home')?.getAttribute('href')).toBe('/');
  });

  it('should render the site footer', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const footer = compiled.querySelector('footer.site-footer');
    expect(footer).toBeTruthy();
    expect(footer?.textContent).toContain('athreya.codes');
    expect(compiled.querySelector('a[aria-label="How"]')?.getAttribute('href')).toBe(
      'https://how.athreya.codes',
    );
  });

  it('should render blurred waves', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.wave3-container')).toBeTruthy();
    expect(compiled.querySelector('.wave3-sky.blur')).toBeTruthy();
  });
});
