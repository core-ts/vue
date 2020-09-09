import {focusFirstError, readOnly} from 'form-util';
import {MetaModel} from 'metadata-x';
import {format, json} from 'model-formatter';
import {setValue} from 'reflectx';
import {clone, makeDiff, trim} from 'reflectx';
import {addParametersIntoUrl, append, buildSearchMessage, changePage, changePageSize, formatResults, getDisplayFields, handleSortEvent, initSearchable, mergeSearchModel, more, optimizeSearchModel, reset, showResults} from 'search-utilities';
import {Vue} from 'vue-property-decorator';
import {Metadata} from './core';
import {messageByHttpStatus} from './core';
import {LoadingService, Locale, message, ResourceService, UIService} from './core';
import {build, buildMessageFromStatusCode, createModel, handleVersion, ResultInfo, Status} from './edit';

export interface ViewService<T, ID> {
  metadata(): Metadata;
  keys(): string[];
  load(id: ID, ctx?: any): Promise<T>;
}
export class ViewComponent<T, ID> extends Vue {
  protected metadata: Metadata;
  protected service: ViewService<T, ID>;
  resource: any = {};
  running: boolean = false;
  protected form: any;
  protected ui: UIService;
  protected loading?: LoadingService;
  protected resourceService?: ResourceService;
  protected showError: (m: string, title?: string, detail?: string, callback?: () => void) => void;

  onCreated(service: ViewService<T, ID>,
      resourceService: ResourceService,
      showError: (m: string, title?: string, detail?: string, callback?: () => void) => void,
      loading?: LoadingService): void {
    this.service = service;
    this.metadata = service.metadata();

    this.showError = showError;
    this.loading = loading;
    this.resourceService = resourceService;
    this.resource = resourceService.resource();

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
  async load(_id: ID) {
    const id: any = _id;
    if (id != null && id !== '') {
      this.running = true;
      if (this.loading) {
        this.loading.showLoading();
      }
      try {
        const obj = await this.service.load(id);
        this.showModel(obj);
      } catch (err) {
        const data = err && err.response ? err.response : err;
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
    }
  }
  protected handleNotFound(form?: any): void {
    const msg = message(this.resourceService, 'error_not_found', 'error');
    if (this.form) {
      readOnly(this.form);
    }
    this.showError(msg.message, msg.title);
  }

  protected getModelName(): string {
    return (this.metadata ? this.metadata.name : 'model');
  }
  showModel(model: T): void {
    const name = this.getModelName();
    this[name] = model;
  }
  getModel(): T {
    const name = this.getModelName();
    const model = this[name];
    return model;
  }
}

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

export interface GenericService<T, ID, R> extends ViewService<T, ID> {
  patch?(obj: T, ctx?: any): Promise<R>;
  insert(obj: T, ctx?: any): Promise<R>;
  update(obj: T, ctx?: any): Promise<R>;
  delete?(id: ID, ctx?: any): Promise<number>;
}

export class EditComponent<T, ID> extends BaseComponent {
  protected service: GenericService<T, ID, number|ResultInfo<T>>;
  protected metadata: Metadata;
  protected metamodel: MetaModel;
  protected showMessage: (msg: string) => void;
  protected confirm: (msg: string, header: string, yesCallback?: () => void, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void;

  newMode = false;
  setBack = false;
  patchable = true;
  backOnSuccess = true;
  protected orginalModel = null;

  addable = true;
  editable = true;
  insertSuccessMsg = '';
  updateSuccessMsg = '';

  onCreated(service: GenericService<T, ID, number|ResultInfo<T>>,
      resourceService: ResourceService,
      ui: UIService,
      getLocale: () => Locale,
      showMessage: (msg: string) => void,
      showError: (m: string, title?: string, detail?: string, callback?: () => void) => void,
      confirm: (m2: string, header: string, yesCallback?: () => void, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void,
      loading?: LoadingService, patchable?: boolean, backOnSaveSuccess?: boolean
    ) {
    this.metadata = service.metadata();
    this.metamodel = build(this.metadata);
    if (patchable === false) {
      this.patchable = patchable;
    }
    if (backOnSaveSuccess === false) {
      this.backOnSuccess = backOnSaveSuccess;
    }
    this.insertSuccessMsg = resourceService.value('msg_save_success');
    this.updateSuccessMsg = resourceService.value('msg_save_success');

    this.service = service;
    this.showMessage = showMessage;
    this.confirm = confirm;

    this.ui = ui;
    this.getLocale = getLocale;
    this.showError = showError;
    this.loading = loading;
    this.resourceService = resourceService;
    this.resource = resourceService.resource();

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
    this.populateModel = this.populateModel.bind(this);
    this.createModel = this.createModel.bind(this);

    this.newOnClick = this.newOnClick.bind(this);
    this.saveOnClick = this.saveOnClick.bind(this);
    this.onSave = this.onSave.bind(this);
    this.validate = this.validate.bind(this);
    this.save = this.save.bind(this);
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
        const data = (err &&  err.response) ? err.response : err;
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
  protected resetState(newMod: boolean, model: T, originalModel: T) {
    this.newMode = newMod;
    this.orginalModel = originalModel;
    this.formatModel(model);
    this.showModel(model);
  }
  protected handleNotFound(form?: any) {
    if (form) {
      readOnly(form);
    }
    const r = this.resourceService;
    const title = r.value('error');
    const msg = r.value('error_not_found');
    this.showError(title, msg);
  }
  protected formatModel(obj: T): void {
    format(obj, this.metamodel, this.getLocale(), this.getCurrencyCode(), this.currencySymbol());
  }
  protected getModelName(): string {
    return (this.metadata ? this.metadata.name : 'model');
  }
  protected showModel(model: T) {
    const n = this.getModelName();
    this[n] = model;
  }
  getRawModel(): T {
    const n = this.getModelName();
    const model = this[n];
    return model;
  }
  getModel(): T {
    return this.populateModel();
  }
  protected populateModel(): T {
    const name = this.getModelName();
    const model: any = this[name];
    const obj = clone(model);
    json(obj, this.metamodel, this.getLocale(), this.getCurrencyCode());
    return obj;
  }

  protected createModel(): T {
    const metadata = this.service.metadata();
    if (metadata) {
      const obj = createModel(metadata);
      return obj;
    } else {
      const obj: any = {};
      return obj;
    }
  }

  newOnClick(event?: any) {
    if (event) {
      event.preventDefault();
      if (!this.form && event.target && event.target.form) {
        this.form = event.target.form;
      }
    }
    const obj = this.createModel();
    this.resetState(true, obj, null);
    const u = this.ui;
    const f = this.form;
    setTimeout(() => {
      u.removeFormError(f);
    }, 60);
  }

  saveOnClick(event?: any, isBack?: boolean): void {
    if (event) {
      event.preventDefault();
      if (!this.form && event.target) {
        this.form = event.target.form;
      }
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
        const diffObj = makeDiff(this.orginalModel, obj, this.metamodel.keys, this.metamodel.version);
        const l = Object.keys(diffObj).length;
        if (l === 0) {
          this.showMessage(r.value('msg_no_change'));
        } else {
          com.validate(obj, () => {
            const msg = message(r, 'msg_confirm_save', 'confirm', 'yes', 'no');
            this.confirm(msg.message, msg.title, () => {
              com.save(obj, diffObj, isBack);
            }, msg.no, msg.yes);
          });
        }
      } else {
        com.validate(obj, () => {
          const msg = message(r, 'msg_confirm_save', 'confirm', 'yes', 'no');
          this.confirm(msg.message, msg.title, () => {
            com.save(obj, obj, isBack);
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

  async save(obj: T, body?: any, isBack?: boolean) {
    this.running = true;
    if (this.loading) {
      this.loading.showLoading();
    }
    const isBackO = (isBack == null || isBack === undefined ? this.backOnSuccess : isBack);
    const com = this;
    try {
      const ctx: any = {};
      if (!this.newMode) {
        if (this.patchable === true && body && Object.keys(body).length > 0) {
          const result = await this.service.patch(body, ctx);
          com.postSave(result, isBackO);
        } else {
          const result = await this.service.update(obj, ctx);
          com.postSave(result, isBackO);
        }
      } else {
        trim(obj);
        const result = await this.service.insert(obj, ctx);
        com.postSave(result, isBackO);
      }
    } catch (err) {
      this.handleError(err);
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
        handleVersion(this.getRawModel(), this.metamodel.version);
      }
    } else {
      handleVersion(this.getRawModel(), this.metamodel.version);
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
    const title = this.resourceService.value('error_internal');
    this.showError(result.message, title);
  }
  protected postSave(res: number|ResultInfo<T>, backOnSave: boolean): void {
    this.running = false;
    if (this.loading) {
      this.loading.hideLoading();
    }
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
      if (result.status === Status.Success) {
        this.succeed(successMsg, backOnSave, result);
      } else if (result.status === Status.Error) {
        this.fail(result);
      } else if (result.status === Status.DuplicateKey) {
        if (newMod) {
          this.handleDuplicateKey(result);
        } else {
          this.handleNotFound();
        }
      } else {
        const r = this.resourceService;
        const msg = buildMessageFromStatusCode(result.status, r);
        const title = r.value('error');
        if (msg && msg.length > 0) {
          this.showError(msg, title);
        } else if (result.message && result.message.length > 0) {
          this.showError(result.message, title);
        } else {
          this.showError(r.value('error_internal'), title);
        }
      }
    }
  }
  protected handleDuplicateKey(result?: ResultInfo<T>): void {
    const msg = message(this.resourceService, 'error_duplicate_key', 'error');
    this.showError(msg.message, msg.title);
  }
}

export interface LocaleFormatter<T> {
  format(obj: T, locale: Locale): T;
}
export interface SearchModel {
  page?: number;
  limit: number;
  firstLimit?: number;
  fields?: string[];
  sort?: string;

  keyword?: string;
  refId?: string|number;
}
export interface SearchResult<T> {
  total?: number;
  results: T[];
  last?: boolean;
}
export interface SearchService<T, S extends SearchModel> {
  search(s: S, ctx?: any): Promise<SearchResult<T>>;
}

export class SearchComponent<T = any, S extends SearchModel = any> extends BaseComponent {
  protected service: SearchService<T, S>;
  protected showMessage: (msg: string) => void;
  // Pagination
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
  sortField: string;
  sortType: string;
  sortTarget: any;
  // listForm: any;
  formatter: LocaleFormatter<T>;
  displayFields: string[];
  initDisplayFields = false;
  sequenceNo = 'sequenceNo';
  triggerSearch = false;
  tmpPageIndex: number;

  pageMaxSize = 20;
  pageSizes: number[] = [10, 20, 40, 60, 100, 200, 400, 1000];

  private xs: any = {};
  protected state: S = this.xs;
  protected list: T[] = [];
  excluding: any;
  hideFilter: boolean;

  chkAll: any = null;
  searchable = true;
  viewable: boolean = true;
  addable: boolean = true;
  editable: boolean = true;
  approvable: boolean = true;
  deletable: boolean = true;

  deleteHeader: string;
  deleteConfirm: string;
  deleteFailed: string;

  onCreated(service: SearchService<T, S>,
    resourceService: ResourceService,
    ui: UIService,
    getLocale: () => Locale,
    showMessage: (msg: string) => void,
    showError: (m: string, header?: string, detail?: string, callback?: () => void) => void,
    loading?: LoadingService) {
    this.state = {} as any;
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

    this.currencySymbol = this.currencySymbol.bind(this);
    this.getCurrencyCode = this.getCurrencyCode.bind(this);
    this.back = this.back.bind(this);
    this.handleError = this.handleError.bind(this);

    this.getModelName = this.getModelName.bind(this);
    this.updateState = this.updateState.bind(this);
    this.updateStateFlat = this.updateStateFlat.bind(this);

    this.toggleFilter = this.toggleFilter.bind(this);
    this.mapToVModel = this.mapToVModel.bind(this);
    this.mergeSearchModel = this.mergeSearchModel.bind(this);
    this.load = this.load.bind(this);
    this.getSearchForm = this.getSearchForm.bind(this);
    this.setSearchForm = this.setSearchForm.bind(this);

    this.setSearchModel = this.setSearchModel.bind(this);
    this.getOriginalSearchModel = this.getOriginalSearchModel.bind(this);
    this.getSearchModel = this.getSearchModel.bind(this);
    this.getDisplayFields = this.getDisplayFields.bind(this);

    this.onPageSizeChanged = this.onPageSizeChanged.bind(this);
    this.pageSizeChanged = this.pageSizeChanged.bind(this);
    this.clearKeyword = this.clearKeyword.bind(this);
    this.searchOnClick = this.searchOnClick.bind(this);

    this.resetAndSearch = this.resetAndSearch.bind(this);
    this.doSearch = this.doSearch.bind(this);
    this.search = this.search.bind(this);
    this.validateSearch = this.validateSearch.bind(this);
    this.searchError = this.searchError.bind(this);
    this.showResults = this.showResults.bind(this);
    this.setList = this.setList.bind(this);
    this.getList = this.getList.bind(this);
    this.sort = this.sort.bind(this);
    this.showMore = this.showMore.bind(this);
    this.pageChanged = this.pageChanged.bind(this);
  }

  toggleFilter(event?: any): void {
    this.hideFilter = !this.hideFilter;
  }

  protected mapToVModel(s: any): void {
    const keys = Object.keys(s);
    keys.forEach(key => {this.$set(this.$data, key, s[key]);});
  }

  mergeSearchModel(obj: any, arrs?: string[]|any, b?: S): S {
    const s = mergeSearchModel(obj, this.pageSizes, arrs, b);
    this.mapToVModel(s);
    return s;
  }

  load(s: S, auto: boolean) {
    const com = this;
    const obj2 = initSearchable(s, com);
    this.setSearchModel(obj2);
    if (auto) {
      setTimeout(() => {
        com.doSearch(true);
      }, 10);
    }
  }

  protected setSearchForm(form: any) {
    this.form = form;
  }
  protected getSearchForm(): any {
    return this.form;
  }

  setSearchModel(obj: S) {
    this.state = obj;
  }
  getOriginalSearchModel(): S {
    return this.state;
  }
  getSearchModel(): S {
    const obj = this.populateSearchModel();
    return obj;
  }
  protected populateSearchModel(): S {
    const obj2 = this.ui.decodeFromForm(this.getSearchForm(), this.getLocale(), this.getCurrencyCode());
    const obj = obj2 ? obj2 : {};
    const obj3 = optimizeSearchModel(obj, this, this.getDisplayFields());
    if (this.excluding) {
      obj3.excluding = this.excluding;
    }
    return obj3;
  }

  protected getDisplayFields(): string[] {
    if (this.displayFields) {
      return this.displayFields;
    }
    if (!this.initDisplayFields) {
      const f = this.getSearchForm();
      if (f) {
        this.displayFields = getDisplayFields(f);
      }
      this.initDisplayFields = true;
    }
    return this.displayFields;
  }

  onPageSizeChanged(event: any): void {
    const ctrl = event.currentTarget;
    this.pageSizeChanged(Number(ctrl.value), event);
  }
  pageSizeChanged(size: number, event?: any): void {
    changePageSize(this, size);
    this.tmpPageIndex = 1;
    this.doSearch();
  }

  clearKeyword(event?: any): void {
    if (event) {
      event.preventDefault();
    }
    this.state.keyword = '';
  }

  searchOnClick(event?: any) {
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
    this.doSearch();
  }

  doSearch(isFirstLoad?: boolean) {
    const listForm = this.getSearchForm();
    if (listForm) {
      this.ui.removeFormError(listForm);
    }
    const s: S = this.getSearchModel();
    const com = this;
    this.validateSearch(s, () => {
      if (com.running === true) {
        return;
      }
      com.running = true;
      if (this.loading) {
        this.loading.showLoading();
      }
      addParametersIntoUrl(s, isFirstLoad);
      com.search(s);
    });
  }

  async search(se: S) {
    try {
      const result = await this.service.search(se);
      this.showResults(se, result);
    } catch (err) {
      this.handleError(err);
    }
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

  showResults(s: SearchModel, sr: SearchResult<T>): void {
    const com = this;
    const results = sr.results;
    if (results != null && results.length > 0) {
      const locale = this.getLocale();
      formatResults(results, this.formatter, locale, this.sequenceNo, this.pageIndex, this.pageSize, this.initPageSize);
    }
    const appendMode = com.appendMode;
    showResults(s, sr, com);
    if (appendMode === false) {
      com.setList(results);
      com.tmpPageIndex = s.page;
      const r = this.resourceService;
      this.showMessage(buildSearchMessage(s, sr, r));
    } else {
      if (this.append === true && s.page > 1) {
        append(this.getList(), results);
      } else {
        this.setList(results);
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
      this.doSearch();
    } else {
      this.resetAndSearch();
    }
  }

  showMore(event?: any): void {
    this.tmpPageIndex = this.pageIndex;
    more(this);
    this.doSearch();
  }

  pageChanged({pageIndex, itemsPerPage}, event?: any): void {
    changePage(this, pageIndex, itemsPerPage);
    this.doSearch();
  }
}
