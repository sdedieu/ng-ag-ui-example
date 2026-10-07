import {
  ChangeDetectionStrategy,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldLabel {
  private readonly parentFormField = inject(FormField);

  // Compute its DOM id safely
  inputId = this.parentFormField?.inputId;
}

@Directive({
  selector: '[form-field-input]',
  host: {
    class: 'rounded-md border border-gray-300 flex-2 px-2 py-2 w-full',
  },
})
export class FormFieldInput {
  readonly el = inject(ElementRef);
}

@Directive({
  selector: '[form-field-select]',
  host: {
    class: 'rounded-md border border-gray-300 flex-2 px-2 py-2 w-full bg-white',
  },
})
export class FormFieldSelect {
  readonly el = inject(ElementRef);
}

@Directive({
  selector: '[form-field-textarea]',
  host: {
    class: 'rounded-md border border-gray-300 flex-2 px-2 py-2 w-full',
  },
})
export class FormFieldTextarea {
  readonly el = inject(ElementRef);
}

@Component({
  selector: 'form-field',
  host: {
    class: 'flex items-center gap-4 w-full',
  },
  template: `
    <ng-content select="form-field-label" />
    <ng-content select="[form-field-input]" />
    <ng-content select="[form-field-select]" />
    <ng-content select="[form-field-textarea]" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormField {
  // Get the projected input as an ElementRef
  input = contentChild<FormFieldInput>(FormFieldInput);
  select = contentChild<FormFieldSelect>(FormFieldSelect);
  textarea = contentChild<FormFieldTextarea>(FormFieldTextarea);

  // Compute its DOM id safely
  inputId = computed(
    () =>
      this.input()?.el?.nativeElement?.id ??
      this.select()?.el?.nativeElement?.id ??
      this.textarea()?.el?.nativeElement?.id ??
      null,
  );
}
