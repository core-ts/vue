import {readOnly} from 'form-util';
import {setValue} from 'reflectx';
import {Vue} from 'vue-property-decorator';
import {LoadingService, Locale, messageByHttpStatus, ResourceService, UIService} from './core';

export class BaseComponent extends Vue {
  protected includingCurrencySymbol = false;
  resource: any = {};
  running: boolean = false;
  protected form: any;
  protected ui: UIService;
  protected loading?: LoadingService;
  protected getLocale: () => Locale;
  protected resourceService?: ResourceService;
  protected showError: (m: string, title?: string, detail?: string, callback?: () => void) => void;

  protected currencySymbol(): boolean {
    return this.includingCurrencySymbol;
  }

  protected getCurrencyCode(): string {
    return (this.form ? this.form.getAttribute('currency-code') : null);
  }

  protected back(e?: any): void {
    if (e) {
      e.preventDefault();
    }
    window.history.back();
  }

  handleError(err: any) {
    this.running = false;
    if (this.loading) {
      this.loading.hideLoading();
    }

    const r = this.resourceService;
    const title = r.value('error');
    let msg = r.value('error_internal');
    if (!err) {
      this.showError(msg, title);
      return;
    }
    const data = err && err.response ? err.response : err;
    if (data) {
      const status = data.status;
      if (status && !isNaN(status)) {
        msg = messageByHttpStatus(status, r);
      }
      if (status === 403) {
        msg = r.value('error_forbidden');
        readOnly(this.form);
        this.showError(msg, title);
      } else if (status === 401) {
        msg = r.value('error_unauthorized');
        readOnly(this.form);
        this.showError(msg, title);
      } else {
        this.showError(msg, title);
      }
    } else {
      this.showError(msg, title);
    }
  }


  protected getModelName(): string {
    return 'state';
  }
  protected updateState(event: any): void {
    this.updateStateFlat(event, this.getLocale());
  }

  protected updateStateFlat(e: any, locale?: Locale): void {
    const ctrl = e.currentTarget;
    let modelName = this.getModelName();
    if (!modelName) {
      modelName = ctrl.form.getAttribute('model-name');
    }
    const type = ctrl.getAttribute('type');
    const isPreventDefault = type && (['checkbox', 'radio'].indexOf(type.toLowerCase()) >= 0 ? false : true);
    if (isPreventDefault) {
      e.preventDefault();
    }
    if (ctrl.nodeName === 'SELECT' && ctrl.value && ctrl.classList.contains('invalid')) {
      this.ui.removeErrorMessage(ctrl);
    }

    const ex: any = this[modelName];
    if (!ex) {
      return;
    }
    const dataField = ctrl.getAttribute('data-field');
    const field = (dataField ? dataField : ctrl.name);
    if (type && type.toLowerCase() === 'checkbox') {
      setValue(ex, field, this.ui.getValue(ctrl));
    } else {
      const v = this.ui.getValue(ctrl, locale);
      // tslint:disable-next-line:triple-equals
      if (ctrl.value != v) {
        setValue(ex, field, v);
      }
    }
  }
}
