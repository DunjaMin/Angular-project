import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { EquityOption, Exchange, SecurityService, SecurityType } from '../security.service';

@Component({
  selector: 'app-security-search',
  templateUrl: './security-search.component.html',
  styleUrls: ['./security-search.component.css']
})
export class SecuritySearchComponent implements OnInit {

  unvalidForm = false;
  results!: EquityOption[];
  selectedSecurity!: EquityOption;
  exchanges!: Exchange[];
  securityTypes!: SecurityType[];

  selectType = [
    { id: '0', name: 'Equals' },
    { id: '1', name: 'Starts With' },
    { id: '2', name: 'Contains' }
  ];

  constructor(
    private securityService: SecurityService,
    private formBuilder: FormBuilder,
    private router: Router) { }

  searchForm = new FormGroup({
    sid: new FormControl(),
    securityType: new FormControl(),
    ticker: new FormControl(),
    selectTypeTicker: new FormControl<number | null>(null),
    description: new FormControl(),
    selectTypeDescription: new FormControl<number | null>(null),
    exchange: new FormControl()
  });

  ngOnInit(): void {

    this.setTypes();
    this.setExchanges();

    this.searchForm = this.formBuilder.group
      ({
        sid: [null],
        securityType: [null],
        ticker: [null],
        selectTypeTicker: [0],
        description: [null],
        selectTypeDescription: [0],
        exchange: [null]
      }
      );
  }

  private setTypes(): Subscription {
    return this.securityService.getTypes()
      .subscribe({
        next: (response: SecurityType[]) => {
          this.securityTypes = response;
        },
        error: (error: Error) => console.log(error)
      });
  }

  private setExchanges(): Subscription {
    return this.securityService.getExchanges()
      .subscribe({
        next: (response: Exchange[]) => {
          this.exchanges = response;
        },
        error: (error: Error) => console.log(error)
      });
  }

  public onSearch(): void {
    const formValue = this.searchForm.value;
    this.securityService.securityFilter(formValue) //TODO try without
      .subscribe({
        next: (response: EquityOption[]) => this.results = response,
        error: (error: HttpErrorResponse) => console.log(error)
      });
  }

  public onClear(): void {
    this.searchForm.reset();
    this.results = [];
    this.searchForm.controls['selectTypeTicker'].setValue(0);
    this.searchForm.controls['selectTypeDescription'].setValue(0);
  }

  public onSelect(security: EquityOption): void {
    if (security.typeId == 1) {
      this.router.navigate(['/equity', security.sid])
    }
    else {
      this.router.navigate(['/equityOption', security.sid])
    }
  }
}
