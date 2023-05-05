import { formatDate } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EquityOption, SecurityService } from 'src/app/security.service';

@Component({
  selector: 'app-equity-option',
  templateUrl: './equity-option.component.html',
  styleUrls: ['./equity-option.component.css']
})

export class EquityOptionComponent implements OnInit {
  private currentSid!: number;
  editMode!: boolean;
  changes: boolean = false;
  strikeChanges: boolean = false;

  @Output() formValue!: Partial<{
    settlementId: number | null;
    strike: number | null;
    sideId: number | null;
    optionStyleId: number | null;
    expirationTime: Date | null;
  }>;
  @Output() changesMade: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private securityService: SecurityService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute
  ) {
    this.changes = false;
    this.strikeChanges = false;
  }

  optionForm = new FormGroup({
    settlementId: new FormControl<number | null>(null),
    strike: new FormControl(),
    sideId: new FormControl<number | null>(null),
    optionStyleId: new FormControl<number | null>(null),
    expirationTime: new FormControl<Date | null>(null)
  });

  get changesForm(): boolean {
    return this.changes;
  }

  ngOnInit(): void {
    this.optionForm = this.formBuilder.group
      ({
        settlementId: [1, [Validators.required]],
        strike: [, [Validators.required,]],
        sideId: [1],
        optionStyleId: [1],
        expirationTime: [new Date(Date.now()), Validators.required]
      }
      );

    const activeSid = this.activatedRoute.snapshot.params['sid'];

    if (activeSid != undefined) {
      this.currentSid = activeSid;
      this.editMode = true;
      this.securityService.getSecurity(this.currentSid)
        .subscribe({
          next: (x: EquityOption) => {
            this.optionForm.patchValue(x);
            this.optionForm.controls.expirationTime.
              setValue(formatDate((x as EquityOption).endDate, 'yyyy-MM-dd', 'en') as unknown as Date);
          }
        });
    }

    this.optionForm.get('strike')!.valueChanges.subscribe({
      next: () => {
        this.strikeChanges = true;
      }
    });

    this.optionForm.get('expirationTime')!.valueChanges.subscribe({
      next: () => {
        if (this.strikeChanges == true) {
          this.changes = true;
        }
      }
    });
  }
  get optionFormValues(): Partial<{
    settlementId: number | null;
    strike: number | null;
    sideId: number | null;
    optionStyleId: number | null;
    expirationTime: Date | null;
  }> {
    return this.optionForm.value;
  }

  resetForm() {
    this.optionForm.reset();
  }
}