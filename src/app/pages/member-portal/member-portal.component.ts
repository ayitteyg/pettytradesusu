import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-member-portal',
  standalone: false,
  templateUrl: './member-portal.component.html',
  styleUrl: './member-portal.component.css'
})
export class MemberPortalComponent implements OnInit{
  private location = inject(Location);
  activePage: string = 'dashboard'; // Default page

  isCollapsed = false;
  isSidebarCollapsed = false;
  is_officer = localStorage.getItem('is_officer')



  
   setActivePage(page: string) {
    this.activePage = page;

    // Dynamically update URL without reloading
    //this.location.replaceState(`${page}`);
    // Or this.location.go(`/general-homepage/${page}`); if you want it to be in browser history

    //when link is clicke(setActivePage), collapse sidebar
     this.isSidebarCollapsed = true;
     this.isCollapsed = true;
  }


  @ViewChild('sidebar', { static: true }) sidebarElement!: ElementRef;
  @Output() sidebarToggled = new EventEmitter<boolean>();


  constructor(private router: Router) {}

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {
      // Detect if the screen width is less than or equal to 768px (typical mobile breakpoint)
        if (window.innerWidth <= 768) {
          this.isSidebarCollapsed = true;
          this.isCollapsed = true;
        }

        if (window.innerWidth >= 768) {
          this.isSidebarCollapsed = true;
          this.isCollapsed = true;
        }

  }




  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent) {
    if (this.isCollapsed === false && this.sidebarElement && !this.sidebarElement.nativeElement.contains(event.target)) {
      this.isCollapsed = true;
      this.sidebarToggled.emit(this.isCollapsed);
    }
  }

 //automatically collapse/expand when the user resizes the window:
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (event.target.innerWidth <= 768) {
      this.isSidebarCollapsed = true;
      this.isCollapsed = true;
    } else {
      this.isSidebarCollapsed = false;
      this.isCollapsed = false;
    }
  }

}
