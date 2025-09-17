import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SavingsComponent } from './pages/savings/savings.component';
import { LoansComponent } from './pages/loans/loans.component';
import { TransactionsComponent } from './pages/transactions/transactions.component';
import { AuthGuard } from './guards/auth.guard';
import { MemDashboardComponent } from './pages/member-portal/mem-dashboard/mem-dashboard.component';
import { MemberPortalComponent } from './pages/member-portal/member-portal.component';
import { SignupComponent } from './pages/signup/signup.component';
import { LoanRequestComponent } from './pages/loan-request/loan-request.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { PreloaderPageComponent } from './pages/preloader-page/preloader-page.component';
import { IntroductionComponent } from './pages/introduction/introduction.component';





const routes: Routes = [


  { path: '', component: IntroductionComponent },

  // { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
   { path: 'signup', component: SignupComponent },
  { 
    path: 'dashboard', 
    component: MemDashboardComponent, 
    
  },
  { 
    path: 'member-portal', 
    component: MemberPortalComponent, 
   
  },
  { 
    path: 'savings', 
    component: SavingsComponent, 
    
  },
  { 
    path: 'loans', 
    component: LoansComponent, 
     
  },
 { 
    path: 'landing', 
    component: LandingPageComponent, 
     
  },

  { 
    path: 'loader', 
    component: PreloaderPageComponent, 
     
  },
   { 
    path: 'loan-request', 
    component: LoanRequestComponent, 
     
  },
  { 
    path: 'transactions', 
    component: TransactionsComponent, 
   
  },

  {path: '**',   component:MemberPortalComponent },
  
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
