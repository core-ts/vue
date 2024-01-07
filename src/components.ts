import { Vue } from 'vue-class-component';
import { createDiffStatus } from '.';
import { Attributes, createEditStatus, EditStatusConfig, DiffApprService, DiffParameter, DiffStatusConfig, error, ErrorMessage, Filter, getModelName, handleToggle, hideLoading, LoadingService, Locale, message, messageByHttpStatus, MetaModel, ResourceService, SearchParameter, SearchResult, SearchService, showLoading, StringMap, UIService, ViewParameter, ViewService } from './core';
import { formatDiffModel, showDiff } from './diff';
import { build, createModel, EditParameter, GenericService, handleStatus, handleVersion, ResultInfo } from './edit';
import { format, json } from './formatter';
import { focusFirstError, readOnly } from './formutil';
import { getConfirmFunc, getDiffStatusFunc, getEditStatusFunc, getErrorFunc, getLoadingFunc, getLocaleFunc, getMsgFunc, getResource, getUIService } from './input';
import { clone, makeDiff, trim, setValue } from './reflect';
import { addParametersIntoUrl, append, buildMessage, changePage, changePageSize, formatResults, getFields, handleSortEvent, initFilter, mergeFilter, more, optimizeFilter, reset, showPaging } from './search';

export const enLocale = {
  'id': 'en-US',
  'countryCode': 'US',
  'dateFormat': 'M/d/yyyy',
  'firstDayOfWeek': 1,
  'decimalSeparator': '.',
  'groupSeparator': ',',
  'decimalDigits': 2,
  'currencyCode': 'USD',
  'currencySymbol': '$',
  'currencyPattern': 0
};
export class ViewComponent<T, ID> extends Vue {
  protected name?: string;
  protected loading?: LoadingService;
  protected showError!: (msg: string, title?: string, detail?: string, callback?: () => void) => void;
  protected loadData?: (id: ID, ctx?: any) => Promise<T | null | undefined>;
  // protected service?: ViewService<T, ID>;
  protected keys?: string[];
  getLocale?: (profile?: string) => Locale;
  resource: StringMap = {} as any;
  protected running?: boolean;
  protected form?: HTMLFormElement;
  onCreated(sv: ((id: ID, ctx?: any) => Promise<T>) | ViewService<T, ID>,
    param: ResourceService | ViewParameter,
    showError?: (msg: string, title?: string, detail?: string, callback?: () => void) => void,
    getLocale?: (profile?: string) => Locale,
    loading?: LoadingService, ignoreDate?: boolean): void {
    const resourceService = getResource(param);
    this.getLocale = getLocaleFunc(param, getLocale);
    this.showError = getErrorFunc(param, showError);
    this.loading = getLoadingFunc(param, loading);
    if (sv) {
      if (typeof sv === 'function') {
        this.loadData = sv;
      } else {
        this.loadData = sv.load;
        if (sv.metadata) {
          const m = sv.metadata();
          if (m) {
            // this.metadata = m;
            const meta = build(m, ignoreDate);
            this.keys = meta.keys;
          }
        }
      }
    }
    this.loading = loading;
    this.resource = resourceService.resource();
    this.bindFunctions = this.bindFunctions.bind(this);
    this.bindFunctions();
  }
  protected bindFunctions() {
    this.getModelName = this.getModelName.bind(this);
    this.back = this.back.bind(this);
    this.handleError = this.handleError.bind(this);
    this.load = this.load.bind(this);
    this.handleNotFound = this.handleNotFound.bind(this);
    this.getModelName = this.getModelName.bind(this);
    this.showModel = this.showModel.bind(this);
    this.getModel = this.getModel.bind(this);
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

    const r = this.resource;
    const title = r['error'];
    let msg = r['error_internal'];
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
        msg = r['error_forbidden'];
        // readOnly(this.form);
        this.showError(msg, title);
      } else if (status === 401) {
        msg = r['error_unauthorized'];
        // readOnly(this.form);
        this.showError(msg, title);
      } else {
        this.showError(msg, title);
      }
    } else {
      this.showError(msg, title);
    }
  }
  load(_id: ID, callback?: (m: T, showF: (model: T) => void) => void) {
    const id: any = _id;
    if (id && id !== '') {
      this.running = true;
      showLoading(this.loading);
      const com = this;
      if (this.loadData) {
        this.loadData(id).then(obj => {
          if (obj) {
            if (callback) {
              callback(obj, com.showModel);
            } else {
              com.showModel(obj);
            }
          } else {
            com.handleNotFound(com.form);
          }
          com.running = false;
          hideLoading(com.loading);
        }).catch(err => {
          const data = (err && err.response) ? err.response : err;
          if (data && data.status === 404) {
            com.handleNotFound(com.form);
          } else {
            error(err, com.resource, com.showError);
          }
          com.running = false;
          hideLoading(com.loading);
        });
      }
    }
  }
  protected handleNotFound(form?: any): void {
    const msg = message(this.resource, 'error_not_found', 'error');
    if (this.form) {
      readOnly(this.form);
    }
    this.showError(msg.message, msg.title);
  }

  protected getModelName(): string {
    if (this.name && this.name.length > 0) {
      return this.name;
    }
    const n = getModelName(this.form);
    if (n && n.length > 0) {
      return n;
    } else {
      return 'model';
    }
  }
  showModel(model: T): void {
    const name = this.getModelName();
    (this as any)[name] = model;
  }
  getModel(): T {
    const name = this.getModelName();
    const model = (this as any)[name];
    return model;
  }
}
interface BaseUIService {
  getValue(el: HTMLInputElement, locale?: Locale, currencyCode?: string): string | number | boolean | null | undefined;
  removeError(el: HTMLInputElement): void;
}
export class BaseComponent extends Vue {
  showError!: ((m: string, title?: string, detail?: string, callback?: () => void) => void);
  includingCurrencySymbol = false;
  resource: StringMap = {} as any;
  running = false;
  form?: HTMLFormElement;
  uiS1: BaseUIService | undefined;
  loading?: LoadingService;
  getLocale?: (() => Locale);

  currencySymbol(): boolean {
    return this.includingCurrencySymbol;
  }
  getCurrencyCode(): string | undefined {
    if (this.form) {
      const x = this.form.getAttribute('currency-code');
      if (x) {
        return x;
      }
    }
    return undefined;
  }

  back(e?: any): void {
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

    const r = this.resource;
    const title = r['error'];
    let msg = r['error_internal'];
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
        msg = r['error_forbidden'];
        readOnly(this.form);
        this.showError(msg, title);
      } else if (status === 401) {
        msg = r['error_unauthorized'];
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
    const n = getModelName(this.form);
    if (!n || n.length === 0) {
      return 'model';
    } else {
      return n;
    }
    // return 'state';
  }
  includes(checkedList: Array<string> | string, v: string): boolean {
    return v && checkedList && Array.isArray(checkedList) ? checkedList.includes(v) : false;
  }
  updateState(event: Event) {
    let locale: Locale = enLocale;
    if (this.getLocale) {
      locale = this.getLocale();
    }
    this.updateStateFlat(event, locale);
  }
  updateStateFlat(e: Event, locale?: Locale) {
    if (!locale) {
      locale = enLocale;
    }
    const ctrl = e.currentTarget as HTMLInputElement;
    let modelName: string | null = this.getModelName();
    if (!modelName && ctrl.form) {
      modelName = ctrl.form.getAttribute('model-name');
    }
    const type = ctrl.getAttribute('type');
    const isPreventDefault = type && (['checkbox', 'radio'].indexOf(type.toLowerCase()) >= 0 ? false : true);
    if (isPreventDefault) {
      e.preventDefault();
    }
    if (this.uiS1 && ctrl.nodeName === 'SELECT' && ctrl.value && ctrl.classList.contains('invalid')) {
      this.uiS1.removeError(ctrl);
    }
    if (modelName) {
      const ex = (this as any)[modelName];
      const dataField = ctrl.getAttribute('data-field');
      const field = (dataField ? dataField : ctrl.name);
      if (type && type.toLowerCase() === 'checkbox') {
        const v = valueOfCheckbox(ctrl);
        setValue(ex, field, v);
      } else {
        let v = ctrl.value;
        if (this.uiS1) {
          v = this.uiS1.getValue(ctrl, locale) as string;
        }
        // tslint:disable-next-line:triple-equals
        if (ctrl.value != v) {
          setValue(ex, field, v);
        }
      }
    }
  }
}
export function valueOfCheckbox(ctrl: HTMLInputElement): string | number | boolean {
  const ctrlOnValue = ctrl.getAttribute('data-on-value');
  const ctrlOffValue = ctrl.getAttribute('data-off-value');
  if (ctrlOnValue && ctrlOffValue) {
    const onValue = ctrlOnValue ? ctrlOnValue : true;
    const offValue = ctrlOffValue ? ctrlOffValue : false;
    return ctrl.checked === true ? onValue : offValue;
  } else {
    return ctrl.checked === true;
  }
}
export class EditComponent<T, ID> extends BaseComponent {
  protected service!: GenericService<T, ID, number|T|ErrorMessage[]>;
  status!: EditStatusConfig;
  protected showMessage!: (msg: string) => void;
  protected confirm!: (msg: string, header: string, yesCallback?: () => void, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void;
  ui!: UIService;
  protected name?: string;
  protected metadata?: Attributes;
  protected metamodel?: MetaModel;
  protected keys?: string[];
  protected version?: string;

  newMode = false;
  setBack = false;
  patchable = true;
  backOnSuccess = true;
  protected orginalModel: T | undefined | null;

  addable = true;
  editable = true;
  insertSuccessMsg = '';
  updateSuccessMsg = '';

  onCreated(service: GenericService<T, ID, number|T|ErrorMessage[]>,
    param: ResourceService | EditParameter,
    showMessage?: (msg: string, option?: string) => void,
    showError?: (m: string, title?: string, detail?: string, callback?: () => void) => void,
    confirm?: (m2: string, header: string, yesCallback?: () => void, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void,
    getLocale?: (profile?: string) => Locale,
    uis?: UIService,
    loading?: LoadingService, status?: EditStatusConfig, patchable?: boolean, ignoreDate?: boolean, backOnSaveSuccess?: boolean
  ) {
    const resourceService = getResource(param);
    this.resource = resourceService.resource();
    this.getLocale = getLocaleFunc(param, getLocale);
    this.loading = getLoadingFunc(param, loading);
    this.ui = getUIService(param, uis);
    this.showError = getErrorFunc(param, showError);
    this.showMessage = getMsgFunc(param, showMessage);
    this.confirm = getConfirmFunc(param, confirm);
    this.status = getEditStatusFunc(param, status);
    if (!this.status) {
      this.status = createEditStatus(this.status);
    }
    if (service.metadata) {
      const metadata = service.metadata();
      if (metadata) {
        const meta = build(metadata, ignoreDate);
        this.keys = meta.keys;
        this.version = meta.version;
        this.metadata = metadata;
        this.metamodel = meta;
      }
    }
    if (!this.keys && service.keys) {
      const k = service.keys();
      if (k) {
        this.keys = k;
      }
    }
    if (!this.keys) {
      this.keys = [];
    }
    if (patchable === false) {
      this.patchable = patchable;
    }
    if (backOnSaveSuccess === false) {
      this.backOnSuccess = backOnSaveSuccess;
    }
    this.insertSuccessMsg = this.resource['msg_save_success'];
    this.updateSuccessMsg = this.resource['msg_save_success'];
    this.service = service;
    this.loading = loading;

    this.bindFunctions = this.bindFunctions.bind(this);
    this.bindFunctions();
  }
  bindFunctions(): void {
    this.currencySymbol = this.currencySymbol.bind(this);
    this.getCurrencyCode = this.getCurrencyCode.bind(this);
    this.back = this.back.bind(this);
    this.handleError = this.handleError.bind(this);

    this.getModelName = this.getModelName.bind(this);
    this.updateState = this.updateState.bind(this);
    this.updateStateFlat = this.updateStateFlat.bind(this);

    this.load = this.load.bind(this);
    this.resetState = this.resetState.bind(this);
    this.handleNotFound = this.handleNotFound.bind(this);
    this.formatModel = this.formatModel.bind(this);
    this.showModel = this.showModel.bind(this);
    this.getRawModel = this.getRawModel.bind(this);
    this.getModel = this.getModel.bind(this);
    this.createModel = this.createModel.bind(this);

    this.create = this.create.bind(this);
    this.save = this.save.bind(this);
    this.onSave = this.onSave.bind(this);
    this.validate = this.validate.bind(this);
    this.doSave = this.doSave.bind(this);
    this.succeed = this.succeed.bind(this);
    this.fail = this.fail.bind(this);
    this.postSave = this.postSave.bind(this);
    this.handleDuplicateKey = this.handleDuplicateKey.bind(this);
  }
  load(_id: ID | null | undefined, callback?: (m: T, showM: (m2: T) => void) => void) {
    const id: any = _id;
    if (id && id !== '') {
      this.service.load(id).then(obj => {
        if (!obj) {
          this.handleNotFound(this.form);
        } else {
          this.newMode = false;
          this.orginalModel = clone(obj);
          this.formatModel(obj);
          if (callback) {
            callback(obj, this.showModel);
          } else {
            this.showModel(obj);
          }
        }
        this.running = false;
        hideLoading(this.loading);
      }).catch(err => {
        const data = (err && err.response) ? err.response : err;
        if (data && data.status === 404) {
          this.handleNotFound(this.form);
        } else {
          error(err, this.resource, this.showError);
        }
        this.running = false;
        hideLoading(this.loading);
      });
    } else {
      this.newMode = true;
      this.orginalModel = undefined;
      const obj = this.createModel();
      if (callback) {
        callback(obj, this.showModel);
      } else {
        this.showModel(obj);
      }
    }
  }
  resetState(newMod: boolean, model: T, originalModel?: T | null) {
    this.newMode = newMod;
    this.orginalModel = originalModel;
    this.formatModel(model);
    this.showModel(model);
  }
  handleNotFound(form?: any) {
    if (form) {
      readOnly(form);
    }
    const r = this.resource;
    const title = r['error'];
    const msg = r['error_not_found'];
    this.showError(title, msg);
  }
  formatModel(obj: T): void {
    if (this.metamodel) {
      let locale: Locale = enLocale;
      if (this.getLocale) {
        locale = this.getLocale();
      }
      format(obj, this.metamodel, locale, this.getCurrencyCode(), this.currencySymbol());
    }
  }
  getModelName(): string {
    if (this.name && this.name.length > 0) {
      return this.name;
    }
    const n = getModelName(this.form);
    if (!n || n.length === 0) {
      return 'model';
    } else {
      return n;
    }
  }
  showModel(model: T) {
    const n = this.getModelName();
    (this as any)[n] = model;
  }
  getRawModel(): T {
    const name = this.getModelName();
    const model = (this as any)[name];
    return model;
  }
  getModel(): T {
    const name = this.getModelName();
    const model = (this as any)[name];
    const obj = clone(model);
    if (this.metamodel) {
      let locale: Locale = enLocale;
      if (this.getLocale) {
        locale = this.getLocale();
      }
      json(obj, this.metamodel, locale, this.getCurrencyCode());
    }
    return obj;
  }
  createModel(): T {
    if (this.service.metadata) {
      const metadata = this.service.metadata();
      if (metadata) {
        const obj = createModel<T>(metadata);
        return obj;
      }
    }
    const obj2: any = {};
    return obj2;
  }

  create(event?: any) {
    if (!this.form && event && event.currentTarget) {
      const ctrl = event.currentTarget as HTMLInputElement;
      if (ctrl.form) {
        this.form = ctrl.form;
      }
    }
    this.resetState(true, this.createModel(), undefined);
    const u = this.ui;
    const f = this.form;
    if (u && f) {
      setTimeout(() => {
        u.removeFormError(f);
      }, 60);
    }
  }

  save(event?: any, isBack?: boolean): void {
    if (!this.form && event && event.currentTarget) {
      this.form = (event.currentTarget as HTMLInputElement).form as any;
    }
    if (isBack) {
      this.onSave(isBack);
    } else {
      this.onSave(this.backOnSuccess);
    }
  }
  onSave(isBack?: boolean) {
    const r = this.resource;
    const newMod = this.newMode;
    if (newMod === true && this.addable === true) {
      const m = message(r, 'error_permission_add', 'error_permission');
      this.showError(m.message, m.title);
      return;
    } else if (this.newMode === false && this.editable === false) {
      const msg = message(r, 'error_permission_edit', 'error_permission');
      this.showError(msg.message, msg.title);
      return;
    } else {
      if (this.running === true) {
        return;
      }
      const com = this;
      const obj = com.getModel();
      if (!newMod) {        
        const diffObj = makeDiff(this.orginalModel, obj, this.keys, this.version);
        const l = Object.keys(diffObj as any).length;
        if (l === 0) {
          this.showMessage(r['msg_no_change']);
        } else {
          com.validate(obj, () => {
            const msg = message(r, 'msg_confirm_save', 'confirm', 'yes', 'no');
            this.confirm(msg.message, msg.title, () => {
              com.doSave(obj, diffObj as any, isBack);
            }, msg.no, msg.yes);
          });
        }
      } else {
        com.validate(obj, () => {
          const msg = message(r, 'msg_confirm_save', 'confirm', 'yes', 'no');
          this.confirm(msg.message, msg.title, () => {
            com.doSave(obj, obj, isBack);
          }, msg.no, msg.yes);
        });
      }
    }
  }
  validate(obj: T, callback: (u?: T) => void): void {
    if (this.ui) {
      let locale: Locale = enLocale;
      if (this.getLocale) {
        locale = this.getLocale();
      }
      const valid = this.ui.validateForm(this.form, locale);
      if (valid) {
        callback(obj);
      }
    } else {
      callback(obj);
    }
  }

  doSave(obj: T, body?: Partial<T>, isBack?: boolean) {
    this.running = true;
    if (this.loading) {
      this.loading.showLoading();
    }
    const isBackO = (isBack == null || isBack === undefined ? this.backOnSuccess : isBack);
    const com = this;
    if (!this.newMode) {
      if (this.service.patch && this.patchable === true && body && Object.keys(body).length > 0) {
        this.service.patch(body).then(result => com.postSave(result, obj, isBackO)).catch(err => this.handleError(err));
      } else {
        this.service.update(obj).then(result => com.postSave(result, obj, isBackO)).catch(err => this.handleError(err));
      }
    } else {
      trim(obj);
      this.service.insert(obj).then(result => com.postSave(result, obj, isBackO)).catch(err => this.handleError(err));
    }
  }

  protected succeed(msg: string, origin: T, isBack?: boolean, model?: T) {
    if (model) {
      this.newMode = false;
      if (model && this.setBack) {
        this.resetState(false, model, clone(model));
      } else {
        handleVersion(origin, this.version);
      }
    } else {
      handleVersion(origin, this.version);
    }
    const isBackO = (isBack == null || isBack === undefined ? this.backOnSuccess : isBack);
    this.showMessage(msg);
    if (isBackO) {
      this.back();
    }
  }
  protected fail(result: ErrorMessage[]) {
    const f = this.form;
    const u = this.ui;
    if (u && f) {
      const unmappedErrors = u.showFormError(f, result);
      focusFirstError(f);
      if (unmappedErrors && unmappedErrors.length > 0) {
        const t = this.resource['error'];
        if (u && u.buildErrorMessage) {
          const msg = u.buildErrorMessage(unmappedErrors);
          this.showError(msg, t);
        } else {
          this.showError(unmappedErrors[0].field + ' ' + unmappedErrors[0].code + ' ' + unmappedErrors[0].message, t);
        }
      }
    } else {
      const t = this.resource['error'];
      if (result.length > 0) {
        this.showError(result[0].field + ' ' + result[0].code + ' ' + result[0].message, t);
      } else {
        this.showError(t, t);
      }
    }
  }
  protected postSave(res: number|string|T|ErrorMessage[], origin: T, isPatch: boolean, backOnSave?: boolean): void {
    this.running = false;
    if (this.loading) {
      this.loading.hideLoading();
    }
    const st = this.status;
    const newMod = this.newMode;
    const successMsg = (newMod ? this.insertSuccessMsg : this.updateSuccessMsg);
    const x: any = res;
    if (Array.isArray(x)) {
      this.fail(x);
    } else if (!isNaN(x)) {
      if (x === st.success) {
        this.succeed(successMsg, origin, backOnSave);
      } else {
        if (newMod && x === st.duplicate_key) {
          this.handleDuplicateKey();
        } else if (!newMod && x === st.not_found) {
          this.handleNotFound();
        } else {
          handleStatus(x as number, st, this.resource, this.showError);
        }
      }
    } else {
      const result: T = x;
      if (isPatch) {
        const keys = Object.keys(result as any);
        const a: any = origin;
        for (const k of keys) {
          a[k] = (result as any)[k];
        }
        this.succeed(successMsg, a, backOnSave);
      } else {
        this.succeed(successMsg, origin, backOnSave, result);
      }
      this.showMessage(successMsg);
    }
  }
  protected handleDuplicateKey(result?: T): void {
    const msg = message(this.resource, 'error_duplicate_key', 'error');
    this.showError(msg.message, msg.title);
  }
}

export interface PageParam {
  pageIndex: number;
  itemsPerPage: number;
}
export class SearchComponent<T, S extends Filter> extends BaseComponent {
  // service: SearchService<T, S> | undefined;
  // service: SearchService<T, S> | undefined;
  resourceService!: ResourceService;
  searchFn!: (s: S, limit?: number, offset?: number | string, fields?: string[]) => Promise<SearchResult<T>>;
  showMessage!: (msg: string, option?: string) => void;
  ui?: UIService;
  // Pagination
  nextPageToken?: string;
  initPageSize = 20;
  pageSize = 20;
  pageIndex = 1;
  itemTotal = 0;
  pageTotal = 0;
  showPaging = false;
  append = false;
  appendMode = false;
  appendable = false;
  // Sortable
  sortField: string | undefined;
  sortType: string | undefined;
  sortTarget: any;
  // listForm: any;
  keys?: string[];
  format?: (obj: T, locale?: Locale) => T;
  fields: string[] | undefined;
  initFields = false;
  sequenceNo = 'sequenceNo';
  triggerSearch = false;
  tmpPageIndex: number | undefined;

  pageMaxSize = 20;
  pageSizes: number[] = [10, 20, 40, 60, 100, 200, 400, 1000];

  filter: S = {} as any;
  list: T[] = [];
  excluding: any;
  hideFilter: boolean | undefined;

  view?:string;
  chkAll: any = null;
  searchable = true;
  viewable = true;
  addable = true;
  editable = true;
  approvable = true;
  deletable = true;

  deleteHeader: string | undefined;
  deleteConfirm: string | undefined;
  deleteFailed: string | undefined;

  onCreated(sv: ((s: S, limit?: number, offset?: number | string, fields?: string[]) => Promise<SearchResult<T>>) | SearchService<T, S>,
    param: ResourceService | SearchParameter,
    showMessage?: (msg: string, option?: string) => void,
    showError?: (m: string, header?: string, detail?: string, callback?: () => void) => void,
    getLocale?: (profile?: string) => Locale,
    uis?: UIService,
    loading?: LoadingService) {
    this.filter = {} as any;
    if (typeof sv === 'function') {
      this.searchFn = sv;
    } else {
      this.searchFn = sv.search;
      // this.service = sv;
      if (sv.keys) {
        this.keys = sv.keys();
      }
    }
    this.ui = getUIService(param, uis);
    this.showError = getErrorFunc(param, showError);
    this.showMessage = getMsgFunc(param, showMessage);

    this.getLocale = getLocale;
    this.loading = loading;
    const resourceService = getResource(param);
    this.resource = resourceService.resource();
    this.resourceService = resourceService;

    this.deleteHeader = resourceService.value('msg_delete_header');
    this.deleteConfirm = resourceService.value('msg_delete_confirm');
    this.deleteFailed = resourceService.value('msg_delete_failed');
    this.bindFunctions = this.bindFunctions.bind(this);
    this.bindFunctions();
  }
  bindFunctions(): void {
    this.currencySymbol = this.currencySymbol.bind(this);
    this.getCurrencyCode = this.getCurrencyCode.bind(this);
    this.back = this.back.bind(this);
    this.handleError = this.handleError.bind(this);

    this.getModelName = this.getModelName.bind(this);
    this.updateState = this.updateState.bind(this);
    this.updateStateFlat = this.updateStateFlat.bind(this);

    this.toggleFilter = this.toggleFilter.bind(this);
    this.mapToVModel = this.mapToVModel.bind(this);
    this.mergeFilter = this.mergeFilter.bind(this);
    this.load = this.load.bind(this);
    this.getSearchForm = this.getSearchForm.bind(this);
    this.setSearchForm = this.setSearchForm.bind(this);

    this.setFilter = this.setFilter.bind(this);
    this.getOriginalFilter = this.getOriginalFilter.bind(this);
    this.getFilter = this.getFilter.bind(this);
    this.getFields = this.getFields.bind(this);

    this.onPageSizeChanged = this.onPageSizeChanged.bind(this);
    this.pageSizeChanged = this.pageSizeChanged.bind(this);
    this.clear = this.clear.bind(this);
    this.search = this.search.bind(this);

    this.resetAndSearch = this.resetAndSearch.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this.doSearch = this.doSearch.bind(this);
    this.validateSearch = this.validateSearch.bind(this);
    this.searchError = this.searchError.bind(this);
    this.showResults = this.showResults.bind(this);
    this.setList = this.setList.bind(this);
    this.getList = this.getList.bind(this);
    this.sort = this.sort.bind(this);
    this.showMore = this.showMore.bind(this);
    this.pageChanged = this.pageChanged.bind(this);

    this.changeView = this.changeView.bind(this);
  }

  changeView(event:any,view?:string):void{
    if (view && view.length > 0) {
      this.view = view;
    } else if (event && event.target) {
      const target = event.target as any;
      const v: string = target.getAttribute('data-view');
      if (v && v.length > 0) {
        this.view =v;
      }
    }
  }
  toggleFilter(event?: any): void {
    const x = !this.hideFilter;
    handleToggle(event.target, this.hideFilter)
    this.hideFilter = !this.hideFilter;
  }

  mapToVModel(s: any): void {
    const keys = Object.keys(s);
    // keys.forEach(key => {this.$set(this.$data, key, s[key]); });
    keys.forEach(key => {
      (this as any)[key] = s[key];
    });
  }

  mergeFilter(obj: any, arrs?: string[] | any, b?: S): S {
    const s = mergeFilter(obj, b, arrs, this.pageSizes);
    this.mapToVModel(s);
    return s;
  }

  load(s: S, auto: boolean) {
    const com = this;
    const obj2 = initFilter(s, com);
    com.setFilter(obj2);
    if (auto) {
      setTimeout(() => {
        com.onSearch(true);
      }, 10);
    }
  }

  setSearchForm(form: any) {

    this.form = form;
  }
  getSearchForm(): any {


    return this.form;
  }

  setFilter(obj: S) {
    this.filter = obj;
  }
  getOriginalFilter(): S {
    return this.filter;
  }
  getFilter(): S {
    let locale: Locale | undefined;
    if (this.getLocale) {
      locale = this.getLocale();
    }
    const sf = this.getSearchForm();
    let obj4 = this.filter;
    if (this.ui && sf) {
      const obj2 = this.ui.decodeFromForm(sf, locale, this.getCurrencyCode());
      obj4 = obj2 ? obj2 : {};
    }
    const obj3 = optimizeFilter(obj4, this, this.getFields());
    if (this.excluding) {
      obj3.excluding = this.excluding;
    }
    return obj3;
  }
  getFields(): string[] | undefined {
    if (this.fields) {
      return this.fields;
    }
    if (!this.initFields) {
      const f = this.getSearchForm();
      if (f) {
        this.fields = getFields(f);
      }
      this.initFields = true;
    }
    return this.fields;
  }

  onPageSizeChanged(event: any): void {
    const ctrl = event.currentTarget;
    this.pageSizeChanged(Number(ctrl.value), event);
  }
  pageSizeChanged(size: number, event?: any): void {
    changePageSize(this, size);
    this.tmpPageIndex = 1;
    this.onSearch();
  }

  clear(event?: any): void {
    if (event) {
      event.preventDefault();
    }
    this.filter.q = '';
  }

  search(event?: any) {
    if (event) {
      event.preventDefault();
      if (!this.getSearchForm()) {
        
        this.setSearchForm(event.target.form);
      }
    }
    this.resetAndSearch();
  }

  resetAndSearch() {
    if (this.running === true) {
      this.triggerSearch = true;
      return;
    }
    reset(this);
    this.tmpPageIndex = 1;


    this.onSearch();
  }

  onSearch(isFirstLoad?: boolean) {
    const com = this;
    const listForm = com.getSearchForm();
    if (listForm && com.ui) {
      com.ui.removeFormError(listForm);
    }
    const s: S = com.getFilter();
    com.validateSearch(s, () => {
      if (com.running === true) {
        return;
      }
      com.running = true;
      if (com.loading) {
        com.loading.showLoading();
      }
      addParametersIntoUrl(s, isFirstLoad);
      com.doSearch(s);
    });
  }

  doSearch(ft: S) {
    const s = clone(ft);
    let page = this.pageIndex;
    if (!page || page < 1) {
      page = 1;
    }
    let offset: number | undefined;
    if (ft.limit) {
      if (ft.firstLimit && ft.firstLimit > 0) {
        offset = ft.limit * (page - 2) + ft.firstLimit;
      } else {
        offset = ft.limit * (page - 1);
      }
    }
    const limit = (page <= 1 && ft.firstLimit && ft.firstLimit > 0 ? ft.firstLimit : ft.limit);
    const next = (this.nextPageToken && this.nextPageToken.length > 0 ? this.nextPageToken : offset);
    const fields = ft.fields;
    delete ft['page'];
    delete ft['fields'];
    delete ft['limit'];
    delete ft['firstLimit'];
    const com = this;
    com.searchFn(ft, limit, next, fields).then(result => {
      com.showResults(s, result);
    }).catch(err => {
      com.handleError(err);
    });
  }

  validateSearch(se: S, callback: () => void): void {
    let valid = true;
    const listForm = this.getSearchForm();
    if (listForm) {
      let locale: Locale = enLocale;
      if (this.getLocale) {
        locale = this.getLocale();
      }
      if (this.ui && this.ui.validateForm) {
        valid = this.ui.validateForm(listForm, locale);
      }
    }
    if (valid === true) {
      callback();
    }
  }

  searchError(response: any): void {
    if (this.tmpPageIndex) {
      this.pageIndex = this.tmpPageIndex;
    }
    error(response, this.resource, this.showError);
  }

  showResults(s: Filter, sr: SearchResult<T>): void {
    const com = this;
    const results = sr.list;
    if (results != null && results.length > 0) {
      let locale: Locale = enLocale;
      if (this.getLocale) {
        locale = this.getLocale();
      }
      formatResults(results, this.pageIndex, this.pageSize, this.initPageSize, this.sequenceNo, this.format, locale);
    }
    const appendMode = com.appendMode;
    com.pageIndex = (s.page && s.page >= 1 ? s.page : 1);
    if (sr.total) {
      com.itemTotal = sr.total;
    }
    if (appendMode) {
      let limit = s.limit;
      if ((!s.page || s.page <= 1) && s.firstLimit && s.firstLimit > 0) {
        limit = s.firstLimit;
      }
      com.nextPageToken = sr.nextPageToken;
      if (this.append && (s.page && s.page > 1)) {
        append(this.getList(), results);
      } else {
        this.setList(results);
      }
    } else {
      showPaging(com, sr.list, s.limit, sr.total);
      com.setList(results);
      com.tmpPageIndex = s.page;
      if (s.limit) {
        this.showMessage(buildMessage(this.resourceService, s.page, s.limit, sr.list, sr.total));
      }
    }
    this.running = false;
    if (this.loading) {
      this.loading.hideLoading();
    }
    if (this.triggerSearch === true) {
      this.triggerSearch = false;
      this.resetAndSearch();
    }
  }

  setList(results: T[]) {
    this.list = results;
  }
  getList(): any[] {
    return this.list;
  }
  sort(event?: any) {
    handleSortEvent(event, this);
    if (this.appendMode === false) {
      this.onSearch();
    } else {
      this.resetAndSearch();
    }
  }

  showMore(event?: any): void {
    this.tmpPageIndex = this.pageIndex;
    more(this);
    this.onSearch();
  }

  pageChanged(p: PageParam, event?: any): void {
    changePage(this, p.pageIndex, p.itemsPerPage);
    this.onSearch();
  }
}

export class DiffApprComponent<T, ID> extends Vue {
  protected status!: DiffStatusConfig;
  protected showMessage!: (msg: string, option?: string) => void;
  protected showError!: (m: string, title?: string, detail?: string, callback?: () => void) => void;
  protected loading?: LoadingService;
  resource: StringMap = {} as any;
  protected running?: boolean;
  protected form?: HTMLFormElement;
  protected id?: ID;
  origin?: T;
  value!: T;
  disabled?: boolean;
  service!: DiffApprService<T, ID>;

  onCreated(service: DiffApprService<T, ID>,
    param: ResourceService | DiffParameter,
    showMessage?: (msg: string, option?: string) => void,
    showError?: (m: string, title?: string, detail?: string, callback?: () => void) => void,
    loading?: LoadingService, status?: DiffStatusConfig) {
    this.service = service;
    const resourceService = getResource(param);
    this.resource = resourceService.resource();
    this.loading = getLoadingFunc(param, loading);
    this.showError = getErrorFunc(param, showError);
    this.showMessage = getMsgFunc(param, showMessage);
    this.status = getDiffStatusFunc(param, status);
    if (!this.status) {
      this.status = createDiffStatus(this.status);
    }
    this.bindFunctions = this.bindFunctions.bind(this);
    this.bindFunctions();
  }
  protected bindFunctions() {
    this.back = this.back.bind(this);
    this.load = this.load.bind(this);
    this.handleNotFound = this.handleNotFound.bind(this);
    this.formatFields = this.formatFields.bind(this);
    this.approve = this.approve.bind(this);
    this.reject = this.reject.bind(this);
    this.handleError = this.handleError.bind(this);
    this.alertError = this.alertError.bind(this);
    this.end = this.end.bind(this);
  }
  protected back(): void {
    window.history.back();
  }

  load(_id: ID) {
    const x: any = _id;
    if (x && x !== '') {
      this.id = _id;
      this.running = true;
      showLoading(this.loading);
      const com = this;
      this.service.diff(_id).then(dobj => {
        if (!dobj) {
          com.handleNotFound(com.form);
        } else {
          const formatdDiff = formatDiffModel(dobj, com.formatFields);
          com.value = formatdDiff.value;
          com.origin = formatdDiff.origin;
          if (com.form) {
            showDiff(com.form, formatdDiff.value, formatdDiff.origin);
          }
        }
        com.running = false;
        hideLoading(com.loading);
      }).catch(err => {
        const data = (err && err.response) ? err.response : err;
        if (data && data.status === 404) {
          com.handleNotFound(com.form);
        } else {
          error(err, com.resource, com.showError);
        }
        com.running = false;
        hideLoading(com.loading);
      });
    }
  }

  protected handleNotFound(form?: any) {
    this.disabled = true;
    this.alertError(this.resource.error_not_found);
  }

  formatFields(value: T): T {
    return value;
  }

  approve(event: any) {
    event.preventDefault();
    if (this.running) {
      return;
    }
    const com = this;
    const st = this.status;
    const r = this.resource;
    if (this.id) {
      this.running = true;
      showLoading(this.loading);
      this.service.approve(this.id).then(status => {
        if (status === st.success) {
          com.showMessage(r['msg_approve_success']);
        } else if (status === st.version_error) {
          com.showMessage(r['msg_approve_version_error']);
        } else if (status === st.not_found) {
          com.handleNotFound(com.form);
        } else {
          com.showError(r['error_internal'], r['error']);
        }
        com.end();
      }).catch(err => {
        com.handleError(err);
        com.end();
      });
    }
  }
  protected end() {
    this.disabled = true;
    this.running = false;
    hideLoading(this.loading);
  }
  reject(event: any) {
    event.preventDefault();
    if (this.running) {
      return;
    }
    const com = this;
    const st = this.status;
    const r = this.resource;
    if (this.id) {
      this.running = true;
      showLoading(this.loading);
      this.service.reject(this.id).then(status => {
        if (status === st.success) {
          com.showMessage(r['msg_reject_success']);
        } else if (status === st.version_error) {
          com.showMessage(r['msg_approve_version_error']);
        } else if (status === st.not_found) {
          com.handleNotFound(com.form);
        } else {
          com.showError(r['error_internal'], r['error']);
        }
        com.end();
      }).catch(err => {
        com.handleError(err);
        com.end();
      });
    }
  }

  handleError(err: any): void {
    const r = this.resource;
    const data = (err && err.response) ? err.response : err;
    if (data && (data.status === 404 || data.status === 409)) {
      if (data.status === 404) {
        this.handleNotFound();
      } else {
        this.showMessage(r['msg_approve_version_error']);
      }
    } else {
      error(err, r, this.showError);
    }
  }

  protected alertError(msg: string): void {
    const title = this.resource['error'];
    this.showError(msg, title);
  }
}
