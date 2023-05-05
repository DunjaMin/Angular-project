import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

//leave as it is
export function nameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;
        if (!value) {
            return null;
        }
        const hasNumeric = /[0-9]+/.test(value);
        const descriptionUnvalid = hasNumeric;
        return descriptionUnvalid ? { haveNumbers: true } : null;
    }
}

export function groupValidator(group: AbstractControl): ValidationErrors | null {
    const fromCtrl = group.get('startDate');
    const toCtrl = group.get('endDate');
    if (fromCtrl == null || toCtrl == null) {
        return null;
    }
    return new Date(fromCtrl!.value) > new Date(toCtrl!.value) ? { message: true } : null;
}