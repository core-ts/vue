import {focusFirstError, readOnly} from 'form-util';
import {MetaModel} from 'metadata-x';
import {format, json} from 'model-formatter';
import {clone, makeDiff, trim} from 'reflectx';
import {BaseComponent} from './BaseComponent';
import {LoadingService, Locale, message, ResourceService, UIService} from './core';
import {Metadata} from './core';
import {build, buildMessageFromStatusCode, createModel, handleVersion, ResultInfo, Status} from './edit';

interface ViewService<T, ID> {
  metadata(): Metadata;
  keys(): string[];
  load(id: ID, ctx?: any): Promise<T>;
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
