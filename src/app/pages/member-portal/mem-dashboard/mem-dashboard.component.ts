import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { ApiService } from '../../../services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { TransactionModalComponent } from '../../../component/transaction-modal/transaction-modal.component';



@Component({
  selector: 'app-mem-dashboard',
  standalone: false,
  templateUrl: './mem-dashboard.component.html',
  styleUrl: './mem-dashboard.component.css'
})



export class MemDashboardComponent{
@ViewChild('savingsChart') savingsChartRef!: ElementRef<HTMLCanvasElement>;
  chart: any;
  

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog
  ) {
    Chart.register(...registerables);
    
  }


  showTable: boolean[] = [];

    loading = false;
    canvasReady = false;
   
 
  username = localStorage.getItem('username');
  church = localStorage.getItem('church')
  memberId = 'CU-00123';


  totalSavings: number = 0;
  totalWithdrawals: number = 0;
  currentBalance: number = 0;

  recentTransactions: any[] = [];

  savingsTrendLabels: string[] = [];
  savingsTrendData: number[] = [];

  // ngOnInit(): void {
  //   this.loadDashboardData();
  // }

   ngOnInit(): void {
    this.canvasReady = true;
    this.loadDashboardData();  // Now safe to render chart

    
    this.apiService.getProfile().subscribe({
    next: (profile) => {
      this.memberId = profile.membership_number;  // ✅ works
    },
    error: (err) => {
      console.error('Failed to load profile:', err);
    }
  });


  }


  toggleTable(index: number) {
    this.showTable[index] = !this.showTable[index];
  }


  loadDashboardData() {
    this.loading = true;
    this.apiService.getDashboardData().subscribe({
      next: (res: any) => {
        if (res.status && res.data) {

          console.log(res.data)

          const summary = res.data.summary;
          const trend = res.data.savings_trend || [];

          this.totalSavings = summary.total_savings || 0;
          this.totalWithdrawals = summary.total_withdrawals || 0;
          this.currentBalance = summary.current_balance || 0;

          this.recentTransactions = res.data.recent_transactions || [];

          this.savingsTrendLabels = trend.map((item: any) => item.month);
          this.savingsTrendData = trend.map((item: any) => item.amount);

           if (this.canvasReady) {
            setTimeout(() => this.renderChart(), 50);  // Ensure canvas is visible
          }
        
          this.loading = false
        }
      },
      error: err => {
        console.error('Dashboard API error', err);
        this.loading = false
      }
    });
  }

  

  renderChart() {
  setTimeout(() => {
    const canvas = document.getElementById('savingsChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Chart canvas element not found.');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Canvas context not found.');
      return;
    }

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.savingsTrendLabels,
        datasets: [{
          label: 'Monthly Savings (₵)',
          data: this.savingsTrendData,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          title: {
            display: true,
            text: 'Savings Trend This Year'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }, 100); // Wait a moment to ensure DOM is ready
}




 openTransactionsModal(): void {
    this.dialog.open(TransactionModalComponent, {
      width: '90%',
      maxWidth: '1000px',
      height: '80vh',
      panelClass: 'custom-dialog-container'
    });
  }


}