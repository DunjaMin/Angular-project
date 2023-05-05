import { DatePipe, formatDate } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, Component, DoCheck, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Currency, Equity, EquityOption, Exchange, SecurityService } from '../security.service';
import { groupValidator } from '../validator';
import { EquityOptionComponent } from './equity-option/equity-option.component';

@Component({
  selector: 'app-equity',
  templateUrl: './equity.component.html',
  styleUrls: ['./equity.component.css']
})

export class EquityComponent implements OnInit{

  activeSecurity!: EquityOption; //TODO change to Equity type --
  currentSid: number;
  exchangess!: Exchange[];
  currencies!: Currency[];
  underliers!: Equity[];
  editMode: boolean;
  securityType: string;
  showMessage = false;
  isEdited!: boolean;
  formatedStartDate!: Date;
  formatedEndDate!: string;
  TypeId!: number;
  errorMessage!: HttpErrorResponse;
  @ViewChild(EquityOptionComponent) optionForm!: EquityOptionComponent;
  optionFormChanged!: boolean;
  updateStatusChange!: boolean;

  constructor(
    private securityService: SecurityService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public datepipe: DatePipe
  ) {
    this.currentSid = 0;
    this.editMode = false;
    this.securityType = '';
    this.optionFormChanged = false;
    this.isEdited=true;
  }

  form = new FormGroup({
    name: new FormControl<string>(''),
    ticker: new FormControl<string>(''),
    exchangeId: new FormControl<number | null>(null),
    currencyId: new FormControl<number | null>(null),
    underlierSid: new FormControl(),
    startDate: new FormControl<Date>(new Date(Date.now())),
    endDate: new FormControl<Date>(new Date(Date.now()))
  });

  ngOnInit(): void {

    this.setExchanges();
    this.setCurrencies();
    this.setUnderliers();

    this.form = this.formBuilder.group
      ({
        name: [(''), [Validators.required]],
        startDate: [new Date(Date.now()), [Validators.required]],
        endDate: [new Date(Date.now()), [Validators.required]],
        ticker: ['', Validators.required],
        exchangeId: [1, Validators.required],
        currencyId: [1, Validators.required],
        underlierSid: []
      },
        { validators: groupValidator }
      );

    const activeSid = this.activatedRoute.snapshot.params['sid'];

    if (activeSid != undefined) {
      this.currentSid = activeSid;
      this.editMode = true;
      this.securityService.getSecurity(this.currentSid)
        .subscribe({
          next: (x: EquityOption) => {
            this.activeSecurity = x;
            this.form.patchValue(x);
            this.form.controls.startDate.
              setValue(formatDate(this.activeSecurity.startDate, 'yyyy-MM-dd', 'en') as unknown as Date);
            this.form.controls.endDate.
              setValue(formatDate(this.activeSecurity.endDate, 'yyyy-MM-dd', 'en') as unknown as Date);
          }
        });
    }

    if (this.router.url.toString().includes("equityOption")) {
      this.securityType = "Equity Option";
    }
    else {
      this.securityType = "Equity";
    }

    if (this.securityType == 'Equity' || this.router.url == "/equity") {
      this.form.get('underlierSid')?.disable();
    }

    if (this.router.url == '/equity') {
      this.TypeId = 1; //TODO magic number
    }
    else {
      this.TypeId = 2; //TODO magic number
    }
  }

  public onSubmit(): void {
    this.upsert();
    this.form.reset();
    this.editMode = false;
  }

  private upsert(): void | EquityOption {
    return this.editMode
      ? this.onUpdateSecurity()
      : this.onAddSecurity();
  }

  public onClick(): void {
    this.optionFormChanged = false;
    if (this.optionForm?.optionFormValues != undefined) {
      this.optionFormChanged = this.optionForm?.changes;
    }
  }

  public onUpdateSecurity(): void {
    let optionFormValue = undefined;
    if (this.optionForm?.optionFormValues != undefined) {
      optionFormValue = this.optionForm?.optionFormValues;
    }
    else {
      optionFormValue = {
        settlementId: undefined,
        strike: undefined,
        optionStyleId: undefined,
        expirationTime: undefined,
        sideId: undefined
      }
    }
    let securityType = { typeId: this.TypeId };

    let security = Object.assign(this.activeSecurity, this.form.value, optionFormValue, securityType)
    console.log(security);
    this.securityService.updateEquity(security)
      .subscribe(
        {
          next: () => {
            this.isEdited = false;
            this.redirect(this.activeSecurity);
            alert('Edited successfully');
            this.isEdited = true;
          },
          error: (error: HttpErrorResponse) => {
            this.errorMessage = error;
            console.log(this.errorMessage);
          }
        }
      );
  }

  public redirect(security: EquityOption): void {
    if (security.settlementId == 0 || security.settlementId == undefined) {
      this.router.navigate(['/equity'])
    }
    else {
      this.router.navigate(['/equityOption'])
      this.isEdited = true;
    }
  }

  public setExchanges(): void {
    this.securityService.getExchanges()
      .subscribe({
        next: (response: Exchange[]) => this.exchangess = response,
        error: (error: HttpErrorResponse) => console.log(error)
      });
  }

  public setCurrencies(): void {
    this.securityService.getCurrencies()
      .subscribe({
        next: (response: Currency[]) => this.currencies = response,
        error: (error: HttpErrorResponse) => console.log(error)
      });
  }

  public setUnderliers(): void {
    this.securityService.returnUnderliers()
      .subscribe({
        next: (response: EquityOption[]) => this.underliers = response,
        error: (error: HttpErrorResponse) => console.log(error)
      });
  }

  public onAddSecurity(): void {

    let optionFormValue = undefined;
    if (this.optionForm?.optionFormValues != undefined) {
      optionFormValue = this.optionForm?.optionFormValues;
    }
    else {
      optionFormValue = {
        settlementId: undefined,
        strike: undefined,
        optionStyleId: undefined,
        expirationTime: undefined,
        sideId: undefined
      }
    }

    let securityType = { typeId: this.TypeId };

    let security = Object.assign(this.form.value, optionFormValue, securityType)
    console.log(security);

    this.securityService.addSecurity(security as EquityOption)
      .subscribe({
        next: (response: EquityOption) => {
          this.showMessage = false;
          this.activeSecurity = response as EquityOption;
          this.showMessage = true;
        },
        error: (error) => this.errorMessage = error
      });
  }
}