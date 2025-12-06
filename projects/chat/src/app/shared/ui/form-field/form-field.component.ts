import {
  Component,
  computed,
  contentChild,
  Directive,
  ElementRef,
  inject,
} from '@angular/core';

@Component({
  selector: 'form-field-label',
  host: {
    class: 'flex-1',
  },
  template: ` <label [attr.for]="inputId()"><ng-content /></label> `,
})
export class FormFieldLabel {
  private readonly parentFormField = inject(FormField);

  // Compute its DOM id safely
  inputId = this.parentFormField?.inputId;
}

@Directive({
  selector: '[form-field-input]',
  host: {
    class: 'rounded-md border border-gray-300 flex-2 px-2',
  },
})
export class FormFieldInput {
  readonly el = inject(ElementRef);
}

@Component({
  selector: 'form-field',
  host: {
    class: 'flex items-center gap-4 w-100',
  },
  template: `
    <ng-content select="form-field-label" />
    <ng-content select="[form-field-input]" />
  `,
})
export class FormField {
  // Get the projected input as an ElementRef
  input = contentChild<FormFieldInput>(FormFieldInput);

  // Compute its DOM id safely
  inputId = computed(() => this.input()?.el?.nativeElement?.id ?? null);
}
