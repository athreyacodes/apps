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
});
