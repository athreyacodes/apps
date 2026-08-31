import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should render title and product cards', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Apps');
    expect(compiled.textContent).toContain('This one shows the graph');
    const cards = compiled.querySelectorAll('.product-card');
    expect(cards.length).toBe(2);
    expect(cards[0]?.getAttribute('href')).toBe('/weather');
    expect(cards[1]?.getAttribute('href')).toBe('/markets');
    expect(compiled.querySelector('img[src="/images/weather.svg"]')).toBeTruthy();
    expect(compiled.querySelector('img[src="/images/markets.svg"]')).toBeTruthy();
  });
});
