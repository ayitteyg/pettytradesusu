import { Component } from '@angular/core';
import * as AOS from 'aos';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
  
})
export class AppComponent {
  title = 'creditunion';


   ngOnInit(): void {
     AOS.init({
      duration: 1200,
      once: true  
    });
  }


}
