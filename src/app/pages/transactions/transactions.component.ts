import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-transactions',
  standalone: false,
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.css'
})
export class TransactionsComponent  implements OnInit {

  transactions: any[] = [];  // <-- Define this to fix the error
  filteredTransactions: any[] = [];
  transactionTypes: string[] = ['all', 'deposit', 'withdrawal', 'charges', 'interest_earned'];
  selectedType: string = 'all';

  constructor(
    private apiservice: ApiService,
    
  ) {}

  ngOnInit(): void {
  this.apiservice.getUserTransactions().subscribe(data => {
    this.transactions = data;
    this.filteredTransactions = data;
  });

}


filterByType(): void {
    if (this.selectedType === 'all') {
      this.filteredTransactions = this.transactions;
    } else {
      this.filteredTransactions = this.transactions.filter(tx => tx.transaction_type === this.selectedType);
    }
  }
}
