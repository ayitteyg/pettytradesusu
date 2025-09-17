import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-introduction',
  standalone: false,
  templateUrl: './introduction.component.html',
  styleUrl: './introduction.component.css'
})


export class IntroductionComponent implements OnInit, OnDestroy {
  currentSlide = 0;
  autoSlideInterval: any;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  startAutoSlide(): void {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 50000); // Change slide every 5 seconds
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % 4;
  }

  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + 4) % 4;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }

  navigateToApp(): void {
    this.router.navigate(['/login']);
  }
}
