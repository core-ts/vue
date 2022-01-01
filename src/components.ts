import { StringMap } from 'index';
import {diff, setValue} from 'reflectx';
import {clone, makeDiff, trim} from 'reflectx';
import {addParametersIntoUrl, append, buildMessage, changePage, changePageSize, formatResults, getFields, handleSortEvent, initFilter, mergeFilter, more, optimizeFilter, reset, showPaging} from 'search-core';
import {Vue} from 'vue-property-decorator';
import {Attributes, DiffApprService, Filter, getModelName, LoadingService, Locale, message, messageByHttpStatus, MetaModel, ResourceService, SearchResult, SearchService, UIService, ViewService} from './core';
import {formatDiffModel} from './diff';
import {build, createModel, GenericService, handleStatus, handleVersion, ResultInfo} from './edit';
import {format, json} from './formatter';
import {focusFirstError, readOnly} from './formutil';

export class ViewComponent<T, ID> extends Vue {
  service: ((id: ID, ctx?: any) => Promise<T>)|ViewService<T, ID>;
  name?: string;
  resource: StringMap = {};
  running = false;
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
        const data = err && (err as any).response ? (err as any).response : err;
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
    const msg = message(this.resourceService.resource(), 'error_not_found', 'error');
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
    if (!n || n.length === 0) {
      return 'model';
    }
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
  includingCurrencySymbol = false;
  resource: any = {};
  running = false;
  form: any;
  ui: UIService;
  loading?: LoadingService;
  getLocale: () => Locale;
  resourceService?: ResourceService;
  showError: (m: string, title?: string, detail?: string, callback?: () => void) => void;

  currencySymbol(): boolean {
    return this.includingCurrencySymbol;
  }

  getCurrencyCode(): string {
    return (this.form ? this.form.getAttribute('currency-code') : null);
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

  getModelName(): string {
    return 'state';
  }
  updateState(event: any): void {
    this.updateStateFlat(event, this.getLocale());
  }

  updateStateFlat(e: any, locale?: Locale): void {
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
      this.ui.removeError(ctrl);
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

export class EditComponent<T, ID> extends BaseComponent {
  protected service: GenericService<T, ID, number|ResultInfo<T>>;
  protected name?: string;
  protected metadata?: Attributes;
  protected metamodel?: MetaModel;
  protected showMessage: (msg: string) => void;
  protected confirm: (msg: string, header: string, yesCallback?: () => void, btnLeftText?: string, btnRightText?: string, noCallback?: () => void) => void;

  newMode = false;
  setBack = false;
  patchable = true;
  backOnSuccess = true;
  protected orginalModel: T|undefined;

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
    this.populateModel = this.populateModel.bind(this);
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
        const data = (err &&  (err as any).response) ? (err as any).response : err;
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
  resetState(newMod: boolean, model: T, originalModel: T) {
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
    format(obj, this.metamodel, this.getLocale(), this.getCurrencyCode(), this.currencySymbol());
  }
  getModelName(): string {
    if (this.name && this.name.length > 0) {
      return this.name;
    }
    const n = getModelName(this.form);
    if (!n || n.length === 0) {
      return 'model';
    }
  }
  showModel(model: T) {
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
  populateModel(): T {
    const name = this.getModelName();
    const model: any = this[name];
    const obj = clone(model);
    json(obj, this.metamodel, this.getLocale(), this.getCurrencyCode());
    return obj;
  }

  createModel(): T {
    const metadata = this.service.metadata();
    if (metadata) {
      const obj = createModel<T>(metadata);
      return obj;
    } else {
      const obj: any = {};
      return obj;
    }
  }

  create(event?: any) {
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

  save(event?: any, isBack?: boolean): void {
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
        const diffObj = makeDiff(this.orginalModel, obj, this.metamodel.keys, this.metamodel.version);
        const l = Object.keys(diffObj).length;
        if (l === 0) {
          this.showMessage(r.value('msg_no_change'));
        } else {
          com.validate(obj, () => {
            const msg = message(r.resource(), 'msg_confirm_save', 'confirm', 'yes', 'no');
            this.confirm(msg.message, msg.title, () => {
              com.doSave(obj, diffObj, isBack);
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

  async doSave(obj: T, body?: any, isBack?: boolean) {
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
        handleStatus(result.status, null, this.resourceService.value, this.showError);
      }
    }
  }
  protected handleDuplicateKey(result?: ResultInfo<T>): void {
    const msg = message(this.resourceService.value, 'error_duplicate_key', 'error');
    this.showError(msg.message, msg.title);
  }
}
export class SearchComponent<T, S extends Filter> extends BaseComponent {
  service: SearchService<T, S>;
  showMessage: (msg: string) => void;
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
  sortField: string;
  sortType: string;
  sortTarget: any;
  // listForm: any;
  format?: (obj: T, locale: Locale) => T;
  fields: string[];
  initFields = false;
  sequenceNo = 'sequenceNo';
  triggerSearch = false;
  tmpPageIndex: number;

  pageMaxSize = 20;
  pageSizes: number[] = [10, 20, 40, 60, 100, 200, 400, 1000];

  model?: S = {} as any;
  list: T[] = [];
  excluding: any;
  hideFilter: boolean;

  chkAll: any = null;
  searchable = true;
  viewable = true;
  addable = true;
  editable = true;
  approvable = true;
  deletable = true;

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
  }
  toggleFilter(event?: any): void {
    this.hideFilter = !this.hideFilter;
  }

  mapToVModel(s: any): void {
    const keys = Object.keys(s);
    keys.forEach(key => {this.$set(this.$data, key, s[key]); });
  }

  mergeFilter(obj: any, arrs?: string[]|any, b?: S): S {
    const s = mergeFilter(obj, this.pageSizes, arrs, b);
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
    const obj2 = this.ui.decodeFromForm(this.getSearchForm(), this.getLocale(), this.getCurrencyCode());
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
    // tslint:disable-next-line:no-debugger
    debugger;
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

  pageChanged({pageIndex, itemsPerPage}, event?: any): void {
    changePage(this, pageIndex, itemsPerPage);
    this.onSearch();
  }
}

export class DiffApprComponent<T, ID> extends Vue {
  protected loading?: LoadingService;
  protected getLocale: () => Locale;
  protected showMessage: (msg: string) => void;
  protected showError: (m: string, title?: string, detail?: string, callback?: () => void) => void;
  protected resourceService?: ResourceService;
  protected service: DiffApprService<T, ID>;

  resource: any;
  protected running: boolean;
  protected form: any;
  protected id: ID = null;
  origin = {};
  value = {};
  disabled = false;

  onCreated(service: DiffApprService<T, ID>,
      resourceService: ResourceService,
      getLocale: () => Locale,
      showMessage: (msg: string) => void,
      showError: (m: string, title?: string, detail?: string, callback?: () => void) => void,
      loading?: LoadingService) {
    this.getLocale = getLocale;
    this.showMessage = showMessage;
    this.showError = showError;

    this.loading = loading;
    this.resourceService = resourceService;
    this.service = service;

    this.resource = resourceService.resource();
    this.back = this.back.bind(this);

    this.load = this.load.bind(this);
    this.handleNotFound = this.handleNotFound.bind(this);
    this.format = this.format.bind(this);
    this.formatFields = this.formatFields.bind(this);
    this.approve = this.approve.bind(this);
    this.reject = this.reject.bind(this);
    this.handleError = this.handleError.bind(this);
    this.alertError = this.alertError.bind(this);
  }

  protected back(): void {
    window.history.back();
  }

  async load(_id: ID) {
    const x: any = _id;
    if (x && x !== '') {
      this.id = _id;
      try {
        this.running = true;
        if (this.loading) {
          this.loading.showLoading();
        }
        const dobj = await this.service.diff(_id);
        if (!dobj) {
          this.handleNotFound(this.form);
        } else {
          const formatdDiff = formatDiffModel(dobj, this.formatFields);
          this.format(formatdDiff.origin, formatdDiff.value);
          this.value = formatdDiff.value;
          this.origin = formatdDiff.origin;
        }
      } catch (err) {
        const data = (err &&  (err as any).response) ? (err as any).response : err;
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

  protected handleNotFound(form?: any) {
    this.disabled = true;
    this.alertError(this.resourceService.value('error_not_found'));
  }

  format(origin: T, value: T): void {
    const differentKeys = diff(origin, value);
    const form = this.form;
    for (const differentKey of differentKeys) {
      const y = form.querySelector('.' + differentKey);
      if (y) {
        if (y.childNodes.length === 3) {
          y.children[1].classList.add('highlight');
          y.children[2].classList.add('highlight');
        } else {
          y.classList.add('highlight');
        }
      }
    }
  }

  formatFields(value: T): T {
    return value;
  }

  async approve(event: any) {
    event.preventDefault();
    if (this.running) {
      return;
    }
    try {
      this.running = true;
      if (this.loading) {
        this.loading.showLoading();
      }
      const status = await this.service.approve(this.id);
      const r = this.resourceService;
      if (status === 1) {
        this.showMessage(r.value('msg_approve_success'));
      } else if (status === 2) {
        this.alertError(r.value('msg_approve_version_error'));
      } else if (status === 0) {
        this.handleNotFound(this.form);
      } else {
        this.alertError(r.value('msg_approve_version_error'));
      }
    } catch (err) {
      this.handleError(err);
    } finally {
      this.disabled = true;
      this.running = false;
      if (this.loading) {
        this.loading.hideLoading();
      }
    }
  }

  async reject(event: any) {
    event.preventDefault();
    if (this.running) {
      return;
    }
    try {
      this.running = true;
      if (this.loading) {
        this.loading.showLoading();
      }
      const status = await this.service.reject(this.id);
      const r = this.resourceService;
      if (status === 1) {
        this.showMessage(r.value('msg_reject_success'));
      } else if (status === 2) {
        this.alertError(r.value('msg_approve_version_error'));
      } else if (status === 0) {
        this.handleNotFound(this.form);
      } else {
        this.alertError(r.value('msg_reject_error'));
      }
    } catch (err) {
      this.handleError(err);
    } finally {
      this.disabled = true;
      this.running = false;
      if (this.loading) {
        this.loading.hideLoading();
      }
    }
  }

  handleError(err: any): void {
    const r = this.resourceService;
    let msg = r.value('error_internal');
    if (err) {
      const data = err.response ? err.response : err;
      const status = data.status;
      if (status && !isNaN(status)) {
        msg = messageByHttpStatus(status, r.resource());
      }
    }
    this.alertError(msg);
  }

  protected alertError(msg: string): void {
    const title = this.resourceService.value('error');
    this.showError(msg, title);
  }
}
