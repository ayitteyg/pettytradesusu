import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Angular Material
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';

// Circle progress
import { NgCircleProgressModule } from 'ng-circle-progress';

// Components
import { AuthInterceptor } from './services/auth-interceptor.service';
import { LoginComponent } from './pages/login/login.component';
import { SavingsComponent } from './pages/savings/savings.component';
import { LoansComponent } from './pages/loans/loans.component';
import { TransactionsComponent } from './pages/transactions/transactions.component';
import { MemberPortalComponent } from './pages/member-portal/member-portal.component';
import { MemDashboardComponent } from './pages/member-portal/mem-dashboard/mem-dashboard.component';
import { SignupComponent } from './pages/signup/signup.component';
import { AddTransactionComponent } from './pages/add-transaction/add-transaction.component';
import { ConfirmDialogComponent } from './component/confirm-dialog/confirm-dialog.component';
import { TransactionModalComponent } from './component/transaction-modal/transaction-modal.component';
import { MomoDepositComponent } from './pages/momo-deposit/momo-deposit.component';
import { LoanRequestComponent } from './pages/loan-request/loan-request.component';
import { MemberProfileComponent } from './pages/member-profile/member-profile.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { PreloaderPageComponent } from './pages/preloader-page/preloader-page.component';
import { WithdrawComponent } from './pages/withdraw/withdraw.component';
import { IntroductionComponent } from './pages/introduction/introduction.component';



const circleProgressConfig = {
  radius: 60,
  outerStrokeWidth: 2,
  innerStrokeWidth: 4,
  outerStrokeColor: '#78C000',
  innerStrokeColor: '#C7E596',
  animationDuration: 300,
  showSubtitle: false,
  showUnits: true,
  startFromZero: false,
};



@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SavingsComponent,
    LoansComponent,
    TransactionsComponent,
    MemberPortalComponent,
    MemDashboardComponent,
    SignupComponent,
    AddTransactionComponent,
    ConfirmDialogComponent,
    TransactionModalComponent,
    MomoDepositComponent,
    LoanRequestComponent,
    MemberProfileComponent,
    LandingPageComponent,
    PreloaderPageComponent,
    WithdrawComponent,
    IntroductionComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,

    // Angular Material
    MatTooltipModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    MatListModule,
    MatTableModule,

    // ✅ Circle Progress config
    NgCircleProgressModule,

    NgCircleProgressModule.forRoot(circleProgressConfig),

    // ✅ Service Worker must be last
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
