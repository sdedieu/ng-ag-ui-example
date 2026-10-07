import { DOCUMENT } from '@angular/common';
import {
  ApplicationRef,
  ComponentRef,
  EmbeddedViewRef,
  EnvironmentInjector,
  Injectable,
  InjectionToken,
  Injector,
  TemplateRef,
  Type,
  ViewRef,
  createComponent,
  inject,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';

export type ComponentType<C> = Type<C>;

export const DIALOG_DATA = new InjectionToken<unknown>('DIALOG_DATA');
export const DIALOG_REF = new InjectionToken<DialogRef>('DIALOG_REF');

export interface DialogConfig<D = unknown, C = unknown> {
  data?: D;
  context?: C;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  panelClass?: string | string[];
  backdropClass?: string | string[];
  ariaLabel?: string;
}

interface DialogContentRef<C> {
  componentRef?: ComponentRef<C>;
  viewRef: ViewRef;
  destroy: () => void;
}

export class DialogRef<R = unknown, C = unknown> {
  private readonly _afterClosed = new Subject<R | undefined>();
  private _contentRef?: DialogContentRef<C>;
  private _overlayElement?: HTMLElement;
  private _isOpen = false;

  readonly afterClosed$: Observable<R | undefined> =
    this._afterClosed.asObservable();

  get componentInstance(): C | undefined {
    return this._contentRef?.componentRef?.instance;
  }

  get isOpen(): boolean {
    return this._isOpen;
  }

  constructor(
    private readonly _openDialog: (dialogRef: DialogRef<R, C>) => void,
    private readonly _closeDialog: (
      dialogRef: DialogRef<R, C>,
      result?: R,
    ) => void,
  ) {}

  open(): void {
    if (this._isOpen) {
      return;
    }

    this._openDialog(this);
  }

  close(result?: R): void {
    if (!this._isOpen) {
      return;
    }
    this._closeDialog(this, result);
  }

  _attach(contentRef: DialogContentRef<C>, overlayElement: HTMLElement): void {
    this._contentRef = contentRef;
    this._overlayElement = overlayElement;
    this._isOpen = true;
  }

  _detach(result?: R): void {
    this._contentRef?.destroy();
    this._overlayElement?.dispatchEvent(new Event('dialog:destroy'));
    this._overlayElement?.remove();
    this._contentRef = undefined;
    this._overlayElement = undefined;
    this._isOpen = false;
    this._afterClosed.next(result);
  }
}

@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly _appRef = inject(ApplicationRef);
  private readonly _document = inject(DOCUMENT);
  private readonly _environmentInjector = inject(EnvironmentInjector);
  private readonly _injector = inject(Injector);
  private readonly _openDialogs: Array<DialogRef<any, any>> = [];
  private _previousBodyOverflow?: string;
  private _nextZIndex = 99;

  create<R = unknown, D = unknown, C = unknown>(
    componentOrTemplateRef: ComponentType<C> | TemplateRef<C>,
    config: DialogConfig<D, C> = {},
  ): DialogRef<R, C> {
    const dialogRef = new DialogRef<R, C>(
      (ref) => this._open(ref, componentOrTemplateRef, config),
      (ref, result) => this._close(ref, result),
    );

    return dialogRef;
  }

  open<R = unknown, D = unknown, C = unknown>(
    componentOrTemplateRef: ComponentType<C> | TemplateRef<C>,
    config: DialogConfig<D, C> = {},
  ): DialogRef<R, C> {
    const dialogRef = this.create<R, D, C>(componentOrTemplateRef, config);
    dialogRef.open();

    return dialogRef;
  }

  close<R = unknown>(result?: R): void {
    this._openDialogs.at(-1)?.close(result);
  }

  private _open<R, D, C>(
    dialogRef: DialogRef<R, C>,
    componentOrTemplateRef: ComponentType<C> | TemplateRef<C>,
    config: DialogConfig<D, C>,
  ): void {
    const overlayElement = this._createOverlayElement(config, dialogRef);
    const panelElement = this._createPanelElement(config);
    const contentRef = this._createContentRef(
      componentOrTemplateRef,
      config,
      dialogRef,
    );

    this._appendContent(panelElement, contentRef.viewRef);
    overlayElement.append(panelElement);
    this._document.body.append(overlayElement);
    dialogRef._attach(contentRef, overlayElement);
    this._openDialogs.push(dialogRef);
    this._lockBodyScroll();

    contentRef.viewRef.detectChanges();
  }

  private _close<R, C>(dialogRef: DialogRef<R, C>, result?: R): void {
    const dialogIndex = this._openDialogs.indexOf(dialogRef);

    if (dialogIndex === -1) {
      return;
    }

    this._openDialogs.splice(dialogIndex, 1);
    dialogRef._detach(result);

    if (this._openDialogs.length === 0) {
      this._unlockBodyScroll();
    }
  }

  private _createContentRef<R, D, C>(
    componentOrTemplateRef: ComponentType<C> | TemplateRef<C>,
    config: DialogConfig<D, C>,
    dialogRef: DialogRef<R, C>,
  ): DialogContentRef<C> {
    if (componentOrTemplateRef instanceof TemplateRef) {
      const embeddedViewRef = componentOrTemplateRef.createEmbeddedView(
        config.context ?? ({} as C),
      );

      this._appRef.attachView(embeddedViewRef);

      return {
        viewRef: embeddedViewRef,
        destroy: () => {
          this._appRef.detachView(embeddedViewRef);
          embeddedViewRef.destroy();
        },
      };
    }

    const componentRef = createComponent(componentOrTemplateRef, {
      environmentInjector: this._environmentInjector,
      elementInjector: Injector.create({
        parent: this._injector,
        providers: [
          { provide: DIALOG_DATA, useValue: config.data },
          { provide: DIALOG_REF, useValue: dialogRef },
        ],
      }),
    });

    this._appRef.attachView(componentRef.hostView);

    return {
      componentRef,
      viewRef: componentRef.hostView,
      destroy: () => {
        this._appRef.detachView(componentRef.hostView);
        componentRef.destroy();
      },
    };
  }

  private _appendContent(panelElement: HTMLElement, viewRef: ViewRef): void {
    const rootNodes = (viewRef as EmbeddedViewRef<unknown>).rootNodes;

    for (const rootNode of rootNodes) {
      panelElement.append(rootNode);
    }
  }

  private _createOverlayElement<R, D, C>(
    config: DialogConfig<D, C>,
    dialogRef: DialogRef<R, C>,
  ): HTMLElement {
    const overlayElement = this._document.createElement('div');

    overlayElement.setAttribute('role', 'presentation');
    overlayElement.style.position = 'fixed';
    overlayElement.style.inset = '0';
    overlayElement.style.zIndex = `${this._nextZIndex++}`;
    overlayElement.style.display = 'flex';
    overlayElement.style.alignItems = 'center';
    overlayElement.style.justifyContent = 'center';
    overlayElement.style.padding = '1rem';
    overlayElement.style.background = 'rgba(17, 24, 39, 0.55)';

    this._addClasses(overlayElement, config.backdropClass);

    if (config.closeOnBackdropClick !== false) {
      overlayElement.addEventListener('click', () => {
        if (this._openDialogs.at(-1) === dialogRef) {
          dialogRef.close();
        }
      });
    }

    if (config.closeOnEscape !== false) {
      const closeOnEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && this._openDialogs.at(-1) === dialogRef) {
          dialogRef.close();
        }
      };

      this._document.addEventListener('keydown', closeOnEscape);
      overlayElement.addEventListener(
        'dialog:destroy',
        () => this._document.removeEventListener('keydown', closeOnEscape),
        { once: true },
      );
    }

    return overlayElement;
  }

  private _createPanelElement<D, C>(config: DialogConfig<D, C>): HTMLElement {
    const panelElement = this._document.createElement('div');

    panelElement.setAttribute('role', 'dialog');
    panelElement.setAttribute('aria-modal', 'true');
    panelElement.style.maxWidth = 'calc(100wh - 2rem)';
    panelElement.style.maxHeight = 'calc(100vh - 2rem)';
    panelElement.style.overflow = 'auto';
    panelElement.style.backgroundColor = 'white';
    panelElement.style.borderRadius = '0.5rem';

    if (config.ariaLabel) {
      panelElement.setAttribute('aria-label', config.ariaLabel);
    }

    panelElement.addEventListener('click', (event) => event.stopPropagation());
    this._addClasses(panelElement, config.panelClass);

    return panelElement;
  }

  private _addClasses(
    element: HTMLElement,
    classes: string | string[] | undefined,
  ): void {
    if (!classes) {
      return;
    }

    const classList = Array.isArray(classes) ? classes : [classes];
    const tokens = classList.flatMap((className) => className.split(/\s+/));

    element.classList.add(...tokens.filter(Boolean));
  }

  private _lockBodyScroll(): void {
    if (this._openDialogs.length !== 1) {
      return;
    }

    this._previousBodyOverflow = this._document.body.style.overflow;
    this._document.body.style.overflow = 'hidden';
  }

  private _unlockBodyScroll(): void {
    this._document.body.style.overflow = this._previousBodyOverflow ?? '';
    this._previousBodyOverflow = undefined;
  }
}
