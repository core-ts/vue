import { addParametersIntoUrl, append, buildMessage, changePage, changePageSize, formatResults, getFields, handleSortEvent, initFilter, mergeFilter, more, optimizeFilter, reset, showPaging } from 'search-core';
import { Attributes, createEditStatus, DiffApprService, EditStatusConfig, Filter, getModelName, handleToggle, LoadingService, Locale, message, messageByHttpStatus, MetaModel, ResourceService, SearchResult, SearchService, UIService, ViewService } from './core';
// import {formatDiffModel} from './diff';
import { build, createModel, EditParameter, GenericService, handleStatus, handleVersion, ResultInfo } from './edit';
import { format, json } from './formatter';
import { focusFirstError, readOnly } from './formutil';
import { clone, makeDiff, trim, setValue } from './reflect';

import { Vue } from "vue-class-component";
import { getConfirmFunc, getEditStatusFunc, getErrorFunc, getLoadingFunc, getLocaleFunc, getMsgFunc, getResource, getUIService } from './input';
import { StringMap } from 'uione';

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
// export class ViewComponent<T, ID> extends Vue {
//   protected service: ViewService<T, ID>;
//   name?: string;
//   resource: any = {};
//   running = false;
//   protected form: any;
//   protected ui: UIService;
//   protected loading?: LoadingService;
//   protected resourceService?: ResourceService;
//   protected showError: (m: string, title?: string, detail?: string, callback?: () => void) => void;

//   onCreated(service: ViewService<T, ID>,
//       resourceService: ResourceService,
//       showError: (m: string, title?: string, detail?: string, callback?: () => void) => void,
//       loading?: LoadingService): void {
//     this.service = service;

//     this.showError = showError;
//     this.loading = loading;
//     this.resourceService = resourceService;
//     this.resource = resourceService.resource();

//     this.back = this.back.bind(this);
//     this.handleError = this.handleError.bind(this);

//     this.load = this.load.bind(this);
//     this.handleNotFound = this.handleNotFound.bind(this);
//     this.getModelName = this.getModelName.bind(this);
//     this.showModel = this.showModel.bind(this);
//     this.getModel = this.getModel.bind(this);
//   }

//   protected back(e?: any): void {
//     if (e) {
//       e.preventDefault();
//     }
//     window.history.back();
//   }

//   handleError(err: any) {
//     this.running = false;
//     if (this.loading) {
//       this.loading.hideLoading();
//     }

//     const r = this.resourceService;
//     const title = r.value('error');
//     let msg = r.value('error_internal');
//     if (!err) {
//       this.showError(msg, title);
//       return;
//     }
//     const data = err && err.response ? err.response : err;
//     if (data) {
//       const status = data.status;
//       if (status && !isNaN(status)) {
//         msg = messageByHttpStatus(status, r.resource());
//       }
//       if (status === 403) {
//         msg = r.value('error_forbidden');
//         readOnly(this.form);
//         this.showError(msg, title);
//       } else if (status === 401) {
//         msg = r.value('error_unauthorized');
//         readOnly(this.form);
//         this.showError(msg, title);
//       } else {
//         this.showError(msg, title);
//       }
//     } else {
//       this.showError(msg, title);
//     }
//   }
//   async load(_id: ID) {
//     const id: any = _id;
//     if (id != null && id !== '') {
//       this.running = true;
//       if (this.loading) {
//         this.loading.showLoading();
//       }
//       try {
//         const obj = await this.service.load(id);
//         this.showModel(obj);
//       } catch (err) {
//         const data = err && (err as any).response ? (err as any).response : err;
//         if (data && data.status === 404) {
//           this.handleNotFound(this.form);
//         } else {
//           this.handleError(err);
//         }
//       } finally {
//         this.running = false;
//         if (this.loading) {
//           this.loading.hideLoading();
//         }
//       }
//     }
//   }
//   protected handleNotFound(form?: any): void {
//     const msg = message(this.resourceService.resource(), 'error_not_found', 'error');
//     if (this.form) {
//       readOnly(this.form);
//     }
//     this.showError(msg.message, msg.title);
//   }

//   protected getModelName(): string {
//     if (this.name && this.name.length > 0) {
//       return this.name;
//     }
//     const n = getModelName(this.form);
//     if (!n || n.length === 0) {
//       return 'model';
//     }
//   }
//   showModel(model: T): void {
//     const name = this.getModelName();
//     this[name] = model;
//   }
//   getModel(): T {
//     const name = this.getModelName();
//     const model = this[name];
//     return model;
//   }
// }
interface BaseUIService {
  getValue(el: HTMLInputElement, locale?: Locale, currencyCode?: string): string | number | boolean | null | undefined;
  removeError(el: HTMLInputElement): void;
}
export class BaseComponent extends Vue {
  includingCurrencySymbol = false;
  resource: StringMap = {} as any;
  running = false;
  form: HTMLFormElement;
  uiS1: BaseUIService | undefined;
  loading?: LoadingService;
  getLocale: (() => Locale);
  resourceService: ResourceService;
  showError: ((m: string, title?: string, detail?: string, callback?: () => void) => void);

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
        msg = messageByHttpStatus(status, r.resource());
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
  protected service: GenericService<T, ID, number | ResultInfo<T>>;
  protected name?: string;
  status: EditStatusConfig;
  protected metadata?: Attributes;
  protected metamodel?: MetaModel;
  protected keys?: string[];
  protected version?: string;
  protected showMessage: (msg: string) => void;
  protected confirm: (msg: string, header: string, yesCallback?: () => void, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void;

  newMode = false;
  setBack = false;
  patchable = true;
  backOnSuccess = true;
  protected orginalModel: T | undefined | null;

  addable = true;
  editable = true;
  insertSuccessMsg = '';
  updateSuccessMsg = '';
  ui: UIService;

  onCreated(service: GenericService<T, ID, number | ResultInfo<T>>,
    param: ResourceService | EditParameter,
    showMessage: (msg: string) => void,
    showError: (m: string, title?: string, detail?: string, callback?: () => void) => void,
    confirm: (m2: string, header: string, yesCallback?: () => void, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void,
    getLocale: () => Locale,
    ui: UIService,
    loading?: LoadingService,
    status?: EditStatusConfig,
    patchable?: boolean,
    ignoreDate?: boolean,
    backOnSaveSuccess?: boolean
  ) {
    this.resourceService = getResource(param);
    this.getLocale = getLocaleFunc(param, getLocale);
    this.loading = getLoadingFunc(param, loading);
    this.ui = getUIService(param, ui);
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
    this.insertSuccessMsg = this.resourceService.value('msg_save_success');
    this.updateSuccessMsg = this.resourceService.value('msg_save_success');

    this.service = service;
    this.showMessage = showMessage;
    this.confirm = confirm;

    this.ui = ui;
    this.getLocale = getLocale;
    this.showError = showError;
    this.loading = loading;
    this.resource = this.resourceService.resource();

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
  async load(_id: ID, callback?: (m: T) => void) {
    const id: any = _id;
    if (id && id !== '') {
      try {
        this.running = true;
        if (this.loading) {
          this.loading.showLoading();
        }
        const obj = await this.service.load(id);
        if (!obj) {
          this.handleNotFound(this.form);
        } else {
          if (callback) {
            callback(obj);
          }
          this.resetState(false, obj, clone(obj));
        }
      } catch (err) {
        const data = (err && (err as any).response) ? (err as any).response : err;
        if (data && data.status === 404) {
          this.handleNotFound(this.form);
        } else {
          this.handleError(err);
        }
      } finally {
        this.running = false;
        if (this.loading) {
          this.loading.hideLoading();
        }
      }
    } else {
      const obj = this.createModel();
      this.resetState(true, obj, null);
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
    const r = this.resourceService;
    const title = r.value('error');
    const msg = r.value('error_not_found');
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
    const r = this.resourceService;
    const newMod = this.newMode;
    if (newMod === true && this.addable === true) {
      const m = message(r.resource(), 'error_permission_add', 'error_permission');
      this.showError(m.message, m.title);
      return;
    } else if (this.newMode === false && this.editable === false) {
      const msg = message(r.resource(), 'error_permission_edit', 'error_permission');
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
          this.showMessage(r.value('msg_no_change'));
        } else {
          com.validate(obj, () => {
            const msg = message(r.resource(), 'msg_confirm_save', 'confirm', 'yes', 'no');
            this.confirm(msg.message, msg.title, () => {
              com.doSave(obj, diffObj as any, isBack);
            }, msg.no, msg.yes);
          });
        }
      } else {
        com.validate(obj, () => {
          const msg = message(r.resource(), 'msg_confirm_save', 'confirm', 'yes', 'no');
          this.confirm(msg.message, msg.title, () => {
            com.doSave(obj, obj, isBack);
          }, msg.no, msg.yes);
        });
      }
    }
  }
  validate(obj: T, callback: (u?: T) => void): void {
    const valid = this.ui.validateForm(this.form, this.getLocale());
    if (valid) {
      callback(obj);
    }
  }

  async doSave(obj: T, body?: Partial<T>, isBack?: boolean) {
    this.running = true;
    if (this.loading) {
      this.loading.showLoading();
    }
    const isBackO = (isBack == null || isBack === undefined ? this.backOnSuccess : isBack);
    const com = this;
    if (!this.newMode) {
      if (this.service.patch && this.patchable === true && body && Object.keys(body).length > 0) {
        this.service.patch(body).then(result => com.postSave(result, isBackO)).catch(err => this.handleError(err));
      } else {
        this.service.update(obj).then(result => com.postSave(result, isBackO)).catch(err => this.handleError(err));
      }
    } else {
      trim(obj);
      this.service.insert(obj).then(result => com.postSave(result, isBackO)).catch(err => this.handleError(err));
    }
  }

  protected succeed(msg: string, backOnSave: boolean, result?: ResultInfo<T>) {
    if (result) {
      const model = result.value;
      this.newMode = false;
      if (model && this.setBack === true) {
        if (!this.backOnSuccess) {
          this.resetState(false, model, clone(model));
        }
      } else {
        handleVersion(this.getRawModel(), this.version);
      }
    } else {
      handleVersion(this.getRawModel(), this.version);
    }
    this.showMessage(msg);
    if (backOnSave) {
      this.back();
    }
  }
  protected fail(result: ResultInfo<T>) {
    const errors = result.errors;
    const f = this.form;
    const u = this.ui;
    const unmappedErrors = u.showFormError(f, errors);
    focusFirstError(f);
    if (!result.message) {
      if (errors && errors.length === 1) {
        result.message = errors[0].message;
      } else {
        result.message = u.buildErrorMessage(unmappedErrors);
      }
    }
    const title = this.resourceService.value('error');
    this.showError(result.message ? result.message : 'Error', title);
  }
  protected postSave(res: number | ResultInfo<T>, backOnSave: boolean): void {
    this.running = false;
    if (this.loading) {
      this.loading.hideLoading();
    }
    const st = this.status;
    const newMod = this.newMode;
    const successMsg = (newMod ? this.insertSuccessMsg : this.updateSuccessMsg);
    const x: any = res;
    if (!isNaN(x)) {
      if (x > 0) {
        this.succeed(successMsg, backOnSave);
      } else {
        if (newMod) {
          this.handleDuplicateKey();
        } else {
          this.handleNotFound();
        }
      }
    } else {
      const result: ResultInfo<T> = x;
      if (result.status === 1) {
        this.succeed(successMsg, backOnSave, result);
      } else if (result.status === 2) {
        this.fail(result);
      } else if (result.status === 0) {
        if (newMod) {
          this.handleDuplicateKey(result);
        } else {
          this.handleNotFound();
        }
      } else {
        handleStatus(result.status, st, this.resourceService.value, this.showError);
      }
    }
  }
  protected handleDuplicateKey(result?: ResultInfo<T>): void {
    const msg = message(this.resourceService.value, 'error_duplicate_key', 'error');
    this.showError(msg.message, msg.title);
  }
}

export class SearchComponent<T, S extends Filter> extends BaseComponent {
  service: SearchService<T, S> | undefined;
  showMessage: ((msg: string) => void) | undefined;
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
  format?: (obj: T, locale: Locale) => T;
  fields: string[] | undefined;
  initFields = false;
  sequenceNo = 'sequenceNo';
  triggerSearch = false;
  tmpPageIndex: number | undefined;

  pageMaxSize = 20;
  pageSizes: number[] = [10, 20, 40, 60, 100, 200, 400, 1000];

  model?: S = {} as any;
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

  onCreated(service: SearchService<T, S>,
    resourceService: ResourceService,
    ui: UIService,
    getLocale: () => Locale,
    showMessage: (msg: string) => void,
    showError: (m: string, header?: string, detail?: string, callback?: () => void) => void,
    loading?: LoadingService) {
    this.model = {} as any;
    this.service = service;
    this.showMessage = showMessage;

    this.ui = ui;
    this.getLocale = getLocale;
    this.showError = showError;
    this.loading = loading;
    this.resourceService = resourceService;
    this.resource = resourceService.resource();

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
      this[key] = s[key];

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
    this.model = obj;
  }
  getOriginalFilter(): S {
    return this.model;
  }
  getFilter(): S {
    const obj = this.populateFilter();
    return obj;
  }
  populateFilter(): S {
    const obj2 = this.ui?.decodeFromForm(this.getSearchForm(), this.getLocale(), this.getCurrencyCode());
    const obj = obj2 ? obj2 : {};
    const obj3 = optimizeFilter(obj, this, this.getFields());
    if (this.excluding) {
      obj3.excluding = this.excluding;
    }
    return obj3;
  }

  getFields(): string[] {
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
    this.model.q = '';
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

  doSearch(se: S) {
    const s = clone(se);
    let page = this.pageIndex;
    if (!page || page < 1) {
      page = 1;
    }
    let offset: number;
    if (se.firstLimit && se.firstLimit > 0) {
      offset = se.limit * (page - 2) + se.firstLimit;
    } else {
      offset = se.limit * (page - 1);
    }
    const limit = (page <= 1 && se.firstLimit && se.firstLimit > 0 ? se.firstLimit : se.limit);
    const next = (this.nextPageToken && this.nextPageToken.length > 0 ? this.nextPageToken : offset);
    const fields = se.fields;
    delete se['page'];
    delete se['fields'];
    delete se['limit'];
    delete se['firstLimit'];
    const com = this;
    com.service.search(se, limit, next, fields).then(result => {
      com.showResults(s, result);
    }).catch(err => {
      com.handleError(err);
    });
  }

  validateSearch(se: S, callback: () => void): void {
    let valid = true;
    const listForm = this.getSearchForm();

    if (listForm) {

      valid = this.ui.validateForm(listForm, this.getLocale());
    }
    if (valid === true) {
      callback();
    }
  }

  searchError(err: any): void {
    this.pageIndex = this.tmpPageIndex;
    this.handleError(err);
  }

  showResults(s: Filter, sr: SearchResult<T>): void {
    const com = this;
    const results = sr.list;
    if (results != null && results.length > 0) {
      const locale = this.getLocale();
      formatResults(results, this.pageIndex, this.pageSize, this.initPageSize, this.sequenceNo, this.format, locale);
    }
    const appendMode = com.appendMode;
    com.pageIndex = (s.page && s.page >= 1 ? s.page : 1);
    if (sr.total) {
      com.itemTotal = sr.total;
    }
    if (appendMode) {
      let limit = s.limit;
      if (s.page <= 1 && s.firstLimit && s.firstLimit > 0) {
        limit = s.firstLimit;
      }
      com.nextPageToken = sr.nextPageToken;
      if (this.append === true && s.page > 1) {
        append(this.getList(), results);
      } else {
        this.setList(results);
      }
    } else {
      showPaging(com, sr.list, s.limit, sr.total);
      com.setList(results);
      com.tmpPageIndex = s.page;
      const r = this.resourceService;
      this.showMessage(buildMessage(r, s.page, s.limit, sr.list, sr.total));
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

  pageChanged({ pageIndex, itemsPerPage }, event?: any): void {
    changePage(this, pageIndex, itemsPerPage);
    this.onSearch();
  }
}

// export class DiffApprComponent<T, ID> extends Vue {
//   protected loading?: LoadingService;
//   protected getLocale: () => Locale;
//   protected showMessage: (msg: string) => void;
//   protected showError: (m: string, title?: string, detail?: string, callback?: () => void) => void;
//   protected resourceService?: ResourceService;
//   protected service: DiffApprService<T, ID>;

//   resource: any;
//   protected running: boolean;
//   protected form: any;
//   protected id: ID = null;
//   origin = {};
//   value = {};
//   disabled = false;

//   onCreated(service: DiffApprService<T, ID>,
//       resourceService: ResourceService,
//       getLocale: () => Locale,
//       showMessage: (msg: string) => void,
//       showError: (m: string, title?: string, detail?: string, callback?: () => void) => void,
//       loading?: LoadingService) {
//     this.getLocale = getLocale;
//     this.showMessage = showMessage;
//     this.showError = showError;

//     this.loading = loading;
//     this.resourceService = resourceService;
//     this.service = service;

//     this.resource = resourceService.resource();
//     this.back = this.back.bind(this);

//     this.load = this.load.bind(this);
//     this.handleNotFound = this.handleNotFound.bind(this);
//     this.format = this.format.bind(this);
//     this.formatFields = this.formatFields.bind(this);
//     this.approve = this.approve.bind(this);
//     this.reject = this.reject.bind(this);
//     this.handleError = this.handleError.bind(this);
//     this.alertError = this.alertError.bind(this);
//   }

//   protected back(): void {
//     window.history.back();
//   }

//   async load(_id: ID) {
//     const x: any = _id;
//     if (x && x !== '') {
//       this.id = _id;
//       try {
//         this.running = true;
//         if (this.loading) {
//           this.loading.showLoading();
//         }
//         const dobj = await this.service.diff(_id);
//         if (!dobj) {
//           this.handleNotFound(this.form);
//         } else {
//           const formatdDiff = formatDiffModel(dobj, this.formatFields);
//           this.format(formatdDiff.origin, formatdDiff.value);
//           this.value = formatdDiff.value;
//           this.origin = formatdDiff.origin;
//         }
//       } catch (err) {
//         const data = (err &&  (err as any).response) ? (err as any).response : err;
//         if (data && data.status === 404) {
//           this.handleNotFound(this.form);
//         } else {
//           this.handleError(err);
//         }
//       } finally {
//         this.running = false;
//         if (this.loading) {
//           this.loading.hideLoading();
//         }
//       }
//     }
//   }

//   protected handleNotFound(form?: any) {
//     this.disabled = true;
//     this.alertError(this.resourceService.value('error_not_found'));
//   }

//   format(origin: T, value: T): void {
//     const differentKeys = diff(origin, value);
//     const form = this.form;
//     for (const differentKey of differentKeys) {
//       const y = form.querySelector('.' + differentKey);
//       if (y) {
//         if (y.childNodes.length === 3) {
//           y.children[1].classList.add('highlight');
//           y.children[2].classList.add('highlight');
//         } else {
//           y.classList.add('highlight');
//         }
//       }
//     }
//   }

//   formatFields(value: T): T {
//     return value;
//   }

//   async approve(event: any) {
//     event.preventDefault();
//     if (this.running) {
//       return;
//     }
//     try {
//       this.running = true;
//       if (this.loading) {
//         this.loading.showLoading();
//       }
//       const status = await this.service.approve(this.id);
//       const r = this.resourceService;
//       if (status === 1) {
//         this.showMessage(r.value('msg_approve_success'));
//       } else if (status === 2) {
//         this.alertError(r.value('msg_approve_version_error'));
//       } else if (status === 0) {
//         this.handleNotFound(this.form);
//       } else {
//         this.alertError(r.value('msg_approve_version_error'));
//       }
//     } catch (err) {
//       this.handleError(err);
//     } finally {
//       this.disabled = true;
//       this.running = false;
//       if (this.loading) {
//         this.loading.hideLoading();
//       }
//     }
//   }

//   async reject(event: any) {
//     event.preventDefault();
//     if (this.running) {
//       return;
//     }
//     try {
//       this.running = true;
//       if (this.loading) {
//         this.loading.showLoading();
//       }
//       const status = await this.service.reject(this.id);
//       const r = this.resourceService;
//       if (status === 1) {
//         this.showMessage(r.value('msg_reject_success'));
//       } else if (status === 2) {
//         this.alertError(r.value('msg_approve_version_error'));
//       } else if (status === 0) {
//         this.handleNotFound(this.form);
//       } else {
//         this.alertError(r.value('msg_reject_error'));
//       }
//     } catch (err) {
//       this.handleError(err);
//     } finally {
//       this.disabled = true;
//       this.running = false;
//       if (this.loading) {
//         this.loading.hideLoading();
//       }
//     }
//   }

//   handleError(err: any): void {
//     const r = this.resourceService;
//     let msg = r.value('error_internal');
//     if (err) {
//       const data = err.response ? err.response : err;
//       const status = data.status;
//       if (status && !isNaN(status)) {
//         msg = messageByHttpStatus(status, r.resource());
//       }
//     }
//     this.alertError(msg);
//   }

//   protected alertError(msg: string): void {
//     const title = this.resourceService.value('error');
//     this.showError(msg, title);
//   }
// }
