import { Component } from '@angular/core';

@Component({
  selector: 'app-transaction-modal',
  standalone: false,
  // templateUrl: './transaction-modal.component.html',
  template: `<app-transactions></app-transactions>`,
  styleUrl: './transaction-modal.component.css'
})
export class TransactionModalComponent {

}
