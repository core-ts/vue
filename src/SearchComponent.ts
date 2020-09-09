import {addParametersIntoUrl, append, buildSearchMessage, changePage, changePageSize, formatResults, getDisplayFields, handleSortEvent, initSearchable, mergeSearchModel, more, optimizeSearchModel, reset, showResults} from 'search-utilities';
import {BaseComponent} from './BaseComponent';
import {LoadingService, Locale, ResourceService, UIService} from './core';

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
    // const keys = Object.keys(s);
    // keys.forEach(key => {this.$set(this.$data, key, s[key]);});
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
