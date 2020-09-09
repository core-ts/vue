import {readOnly} from 'form-util';
import {Vue} from 'vue-property-decorator';
import {message} from './core';
import {LoadingService, messageByHttpStatus, Metadata, ResourceService, UIService} from './core';

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
