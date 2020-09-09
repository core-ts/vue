"use strict";
var __extends = (this && this.__extends) || (function(){
  var extendStatics=function(d, b){
    extendStatics = Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array && function(d, b){ d.__proto__ = b; }) ||
      function(d, b){ for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
  };
  return function(d, b){
    extendStatics(d, b);
    function __(){ this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
})();
var __awaiter = (this && this.__awaiter) || function(thisArg, _arguments, P, generator){
  function adopt(value){ return value instanceof P ? value : new P(function(resolve){ resolve(value); }); }
  return new (P || (P = Promise))(function(resolve, reject){
    function fulfilled(value){ try { step(generator.next(value)); } catch (e){ reject(e); } }
    function rejected(value){ try { step(generator["throw"](value)); } catch (e){ reject(e); } }
    function step(result){ result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __generator = (this && this.__generator) || function(thisArg, body){
  var _ = { label: 0, sent: function(){ if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator]=function(){ return this; }), g;
  function verb(n){ return function(v){ return step([n, v]); }; }
  function step(op){
    if (f) throw new TypeError("Generator is already executing.");
    while (_) try {
      if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
      if (y = 0, t) op = [op[0] & 2, t.value];
      switch (op[0]){
        case 0: case 1: t = op; break;
        case 4: _.label++; return { value: op[1], done: false };
        case 5: _.label++; y = op[1]; op = [0]; continue;
        case 7: op = _.ops.pop(); _.trys.pop(); continue;
        default:
          if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)){ _ = 0; continue; }
          if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))){ _.label = op[1]; break; }
          if (op[0] === 6 && _.label < t[1]){ _.label = t[1]; t = op; break; }
          if (t && _.label < t[2]){ _.label = t[2]; _.ops.push(op); break; }
          if (t[2]) _.ops.pop();
          _.trys.pop(); continue;
      }
      op = body.call(thisArg, _);
    } catch (e){ op = [6, e]; y = 0; } finally { f = t = 0; }
    if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
  }
};
Object.defineProperty(exports,"__esModule",{value:true});
var form_util_1 = require("form-util");
var model_formatter_1 = require("model-formatter");
var reflectx_1 = require("reflectx");
var reflectx_2 = require("reflectx");
var search_utilities_1 = require("search-utilities");
var vue_property_decorator_1 = require("vue-property-decorator");
var core_1 = require("./core");
var core_2 = require("./core");
var edit_1 = require("./edit");
var ViewComponent = (function(_super){
  __extends(ViewComponent, _super);
  function ViewComponent(){
    var _this = _super !== null && _super.apply(this, arguments) || this;
    _this.resource = {};
    _this.running = false;
    return _this;
  }
  ViewComponent.prototype.onCreated=function(service, resourceService, showError, loading){
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
  };
  ViewComponent.prototype.back=function(e){
    if (e){
      e.preventDefault();
    }
    window.history.back();
  };
  ViewComponent.prototype.handleError=function(err){
    this.running = false;
    if (this.loading){
      this.loading.hideLoading();
    }
    var r = this.resourceService;
    var title = r.value('error');
    var msg = r.value('error_internal');
    if (!err){
      this.showError(msg, title);
      return;
    }
    var data = err && err.response ? err.response : err;
    if (data){
      var status_1 = data.status;
      if (status_1 && !isNaN(status_1)){
        msg = core_1.messageByHttpStatus(status_1, r);
      }
      if (status_1 === 403){
        msg = r.value('error_forbidden');
        form_util_1.readOnly(this.form);
        this.showError(msg, title);
      }
      else if (status_1 === 401){
        msg = r.value('error_unauthorized');
        form_util_1.readOnly(this.form);
        this.showError(msg, title);
      }
      else {
        this.showError(msg, title);
      }
    }
    else {
      this.showError(msg, title);
    }
  };
  ViewComponent.prototype.load=function(_id){
    return __awaiter(this, void 0, void 0, function(){
      var id, obj, err_1, data;
      return __generator(this, function(_a){
        switch (_a.label){
          case 0:
            id = _id;
            if (!(id != null && id !== '')) return [3, 5];
            this.running = true;
            if (this.loading){
              this.loading.showLoading();
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            return [4, this.service.load(id)];
          case 2:
            obj = _a.sent();
            this.showModel(obj);
            return [3, 5];
          case 3:
            err_1 = _a.sent();
            data = err_1 && err_1.response ? err_1.response : err_1;
            if (data && data.status === 404){
              this.handleNotFound(this.form);
            }
            else {
              this.handleError(err_1);
            }
            return [3, 5];
          case 4:
            this.running = false;
            if (this.loading){
              this.loading.hideLoading();
            }
            return [7];
          case 5: return [2];
        }
      });
    });
  };
  ViewComponent.prototype.handleNotFound=function(form){
    var msg = core_2.message(this.resourceService, 'error_not_found', 'error');
    if (this.form){
      form_util_1.readOnly(this.form);
    }
    this.showError(msg.message, msg.title);
  };
  ViewComponent.prototype.getModelName=function(){
    return (this.metadata ? this.metadata.name : 'model');
  };
  ViewComponent.prototype.showModel=function(model){
    var name = this.getModelName();
    this[name] = model;
  };
  ViewComponent.prototype.getModel=function(){
    var name = this.getModelName();
    var model = this[name];
    return model;
  };
  return ViewComponent;
}(vue_property_decorator_1.Vue));
exports.ViewComponent = ViewComponent;
var BaseComponent = (function(_super){
  __extends(BaseComponent, _super);
  function BaseComponent(){
    var _this = _super !== null && _super.apply(this, arguments) || this;
    _this.includingCurrencySymbol = false;
    _this.resource = {};
    _this.running = false;
    return _this;
  }
  BaseComponent.prototype.currencySymbol=function(){
    return this.includingCurrencySymbol;
  };
  BaseComponent.prototype.getCurrencyCode=function(){
    return (this.form ? this.form.getAttribute('currency-code') : null);
  };
  BaseComponent.prototype.back=function(e){
    if (e){
      e.preventDefault();
    }
    window.history.back();
  };
  BaseComponent.prototype.handleError=function(err){
    this.running = false;
    if (this.loading){
      this.loading.hideLoading();
    }
    var r = this.resourceService;
    var title = r.value('error');
    var msg = r.value('error_internal');
    if (!err){
      this.showError(msg, title);
      return;
    }
    var data = err && err.response ? err.response : err;
    if (data){
      var status_2 = data.status;
      if (status_2 && !isNaN(status_2)){
        msg = core_1.messageByHttpStatus(status_2, r);
      }
      if (status_2 === 403){
        msg = r.value('error_forbidden');
        form_util_1.readOnly(this.form);
        this.showError(msg, title);
      }
      else if (status_2 === 401){
        msg = r.value('error_unauthorized');
        form_util_1.readOnly(this.form);
        this.showError(msg, title);
      }
      else {
        this.showError(msg, title);
      }
    }
    else {
      this.showError(msg, title);
    }
  };
  BaseComponent.prototype.getModelName=function(){
    return 'state';
  };
  BaseComponent.prototype.updateState=function(event){
    this.updateStateFlat(event, this.getLocale());
  };
  BaseComponent.prototype.updateStateFlat=function(e, locale){
    var ctrl = e.currentTarget;
    var modelName = this.getModelName();
    if (!modelName){
      modelName = ctrl.form.getAttribute('model-name');
    }
    var type = ctrl.getAttribute('type');
    var isPreventDefault = type && (['checkbox', 'radio'].indexOf(type.toLowerCase()) >= 0 ? false : true);
    if (isPreventDefault){
      e.preventDefault();
    }
    if (ctrl.nodeName === 'SELECT' && ctrl.value && ctrl.classList.contains('invalid')){
      this.ui.removeErrorMessage(ctrl);
    }
    var ex = this[modelName];
    if (!ex){
      return;
    }
    var dataField = ctrl.getAttribute('data-field');
    var field = (dataField ? dataField : ctrl.name);
    if (type && type.toLowerCase() === 'checkbox'){
      reflectx_1.setValue(ex, field, this.ui.getValue(ctrl));
    }
    else {
      var v = this.ui.getValue(ctrl, locale);
      if (ctrl.value != v){
        reflectx_1.setValue(ex, field, v);
      }
    }
  };
  return BaseComponent;
}(vue_property_decorator_1.Vue));
exports.BaseComponent = BaseComponent;
var EditComponent = (function(_super){
  __extends(EditComponent, _super);
  function EditComponent(){
    var _this = _super !== null && _super.apply(this, arguments) || this;
    _this.newMode = false;
    _this.setBack = false;
    _this.patchable = true;
    _this.backOnSuccess = true;
    _this.orginalModel = null;
    _this.addable = true;
    _this.editable = true;
    _this.insertSuccessMsg = '';
    _this.updateSuccessMsg = '';
    return _this;
  }
  EditComponent.prototype.onCreated=function(service, resourceService, ui, getLocale, showMessage, showError, confirm, loading, patchable, backOnSaveSuccess){
    this.metadata = service.metadata();
    this.metamodel = edit_1.build(this.metadata);
    if (patchable === false){
      this.patchable = patchable;
    }
    if (backOnSaveSuccess === false){
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
  };
  EditComponent.prototype.load=function(_id, callback){
    return __awaiter(this, void 0, void 0, function(){
      var id, obj, err_2, data, obj;
      return __generator(this, function(_a){
        switch (_a.label){
          case 0:
            id = _id;
            if (!(id && id !== '')) return [3, 6];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            this.running = true;
            if (this.loading){
              this.loading.showLoading();
            }
            return [4, this.service.load(id)];
          case 2:
            obj = _a.sent();
            if (!obj){
              this.handleNotFound(this.form);
            }
            else {
              if (callback){
                callback(obj);
              }
              this.resetState(false, obj, reflectx_2.clone(obj));
            }
            return [3, 5];
          case 3:
            err_2 = _a.sent();
            data = (err_2 && err_2.response) ? err_2.response : err_2;
            if (data && data.status === 404){
              this.handleNotFound(this.form);
            }
            else {
              this.handleError(err_2);
            }
            return [3, 5];
          case 4:
            this.running = false;
            if (this.loading){
              this.loading.hideLoading();
            }
            return [7];
          case 5: return [3, 7];
          case 6:
            obj = this.createModel();
            this.resetState(true, obj, null);
            _a.label = 7;
          case 7: return [2];
        }
      });
    });
  };
  EditComponent.prototype.resetState=function(newMod, model, originalModel){
    this.newMode = newMod;
    this.orginalModel = originalModel;
    this.formatModel(model);
    this.showModel(model);
  };
  EditComponent.prototype.handleNotFound=function(form){
    if (form){
      form_util_1.readOnly(form);
    }
    var r = this.resourceService;
    var title = r.value('error');
    var msg = r.value('error_not_found');
    this.showError(title, msg);
  };
  EditComponent.prototype.formatModel=function(obj){
    model_formatter_1.format(obj, this.metamodel, this.getLocale(), this.getCurrencyCode(), this.currencySymbol());
  };
  EditComponent.prototype.getModelName=function(){
    return (this.metadata ? this.metadata.name : 'model');
  };
  EditComponent.prototype.showModel=function(model){
    var n = this.getModelName();
    this[n] = model;
  };
  EditComponent.prototype.getRawModel=function(){
    var n = this.getModelName();
    var model = this[n];
    return model;
  };
  EditComponent.prototype.getModel=function(){
    return this.populateModel();
  };
  EditComponent.prototype.populateModel=function(){
    var name = this.getModelName();
    var model = this[name];
    var obj = reflectx_2.clone(model);
    model_formatter_1.json(obj, this.metamodel, this.getLocale(), this.getCurrencyCode());
    return obj;
  };
  EditComponent.prototype.createModel=function(){
    var metadata = this.service.metadata();
    if (metadata){
      var obj = edit_1.createModel(metadata);
      return obj;
    }
    else {
      var obj = {};
      return obj;
    }
  };
  EditComponent.prototype.newOnClick=function(event){
    if (event){
      event.preventDefault();
      if (!this.form && event.target && event.target.form){
        this.form = event.target.form;
      }
    }
    var obj = this.createModel();
    this.resetState(true, obj, null);
    var u = this.ui;
    var f = this.form;
    setTimeout(function(){
      u.removeFormError(f);
    }, 60);
  };
  EditComponent.prototype.saveOnClick=function(event, isBack){
    if (event){
      event.preventDefault();
      if (!this.form && event.target){
        this.form = event.target.form;
      }
    }
    if (isBack){
      this.onSave(isBack);
    }
    else {
      this.onSave(this.backOnSuccess);
    }
  };
  EditComponent.prototype.onSave=function(isBack){
    var _this = this;
    var r = this.resourceService;
    var newMod = this.newMode;
    if (newMod === true && this.addable === true){
      var m = core_2.message(r, 'error_permission_add', 'error_permission');
      this.showError(m.message, m.title);
      return;
    }
    else if (this.newMode === false && this.editable === false){
      var msg = core_2.message(r, 'error_permission_edit', 'error_permission');
      this.showError(msg.message, msg.title);
      return;
    }
    else {
      if (this.running === true){
        return;
      }
      var com_1 = this;
      var obj_1 = com_1.getModel();
      if (!newMod){
        var diffObj_1 = reflectx_2.makeDiff(this.orginalModel, obj_1, this.metamodel.keys, this.metamodel.version);
        var l = Object.keys(diffObj_1).length;
        if (l === 0){
          this.showMessage(r.value('msg_no_change'));
        }
        else {
          com_1.validate(obj_1, function(){
            var msg = core_2.message(r, 'msg_confirm_save', 'confirm', 'yes', 'no');
            _this.confirm(msg.message, msg.title, function(){
              com_1.save(obj_1, diffObj_1, isBack);
            }, msg.no, msg.yes);
          });
        }
      }
      else {
        com_1.validate(obj_1, function(){
          var msg = core_2.message(r, 'msg_confirm_save', 'confirm', 'yes', 'no');
          _this.confirm(msg.message, msg.title, function(){
            com_1.save(obj_1, obj_1, isBack);
          }, msg.no, msg.yes);
        });
      }
    }
  };
  EditComponent.prototype.validate=function(obj, callback){
    var valid = this.ui.validateForm(this.form, this.getLocale());
    if (valid){
      callback(obj);
    }
  };
  EditComponent.prototype.save=function(obj, body, isBack){
    return __awaiter(this, void 0, void 0, function(){
      var isBackO, com, ctx, result, result, result, err_3;
      return __generator(this, function(_a){
        switch (_a.label){
          case 0:
            this.running = true;
            if (this.loading){
              this.loading.showLoading();
            }
            isBackO = (isBack == null || isBack === undefined ? this.backOnSuccess : isBack);
            com = this;
            _a.label = 1;
          case 1:
            _a.trys.push([1, 9, , 10]);
            ctx = {};
            if (!!this.newMode) return [3, 6];
            if (!(this.patchable === true && body && Object.keys(body).length > 0)) return [3, 3];
            return [4, this.service.patch(body, ctx)];
          case 2:
            result = _a.sent();
            com.postSave(result, isBackO);
            return [3, 5];
          case 3: return [4, this.service.update(obj, ctx)];
          case 4:
            result = _a.sent();
            com.postSave(result, isBackO);
            _a.label = 5;
          case 5: return [3, 8];
          case 6:
            reflectx_2.trim(obj);
            return [4, this.service.insert(obj, ctx)];
          case 7:
            result = _a.sent();
            com.postSave(result, isBackO);
            _a.label = 8;
          case 8: return [3, 10];
          case 9:
            err_3 = _a.sent();
            this.handleError(err_3);
            return [3, 10];
          case 10: return [2];
        }
      });
    });
  };
  EditComponent.prototype.succeed=function(msg, backOnSave, result){
    if (result){
      var model = result.value;
      this.newMode = false;
      if (model && this.setBack === true){
        if (!this.backOnSuccess){
          this.resetState(false, model, reflectx_2.clone(model));
        }
      }
      else {
        edit_1.handleVersion(this.getRawModel(), this.metamodel.version);
      }
    }
    else {
      edit_1.handleVersion(this.getRawModel(), this.metamodel.version);
    }
    this.showMessage(msg);
    if (backOnSave){
      this.back();
    }
  };
  EditComponent.prototype.fail=function(result){
    var errors = result.errors;
    var f = this.form;
    var u = this.ui;
    var unmappedErrors = u.showFormError(f, errors);
    form_util_1.focusFirstError(f);
    if (!result.message){
      if (errors && errors.length === 1){
        result.message = errors[0].message;
      }
      else {
        result.message = u.buildErrorMessage(unmappedErrors);
      }
    }
    var title = this.resourceService.value('error_internal');
    this.showError(result.message, title);
  };
  EditComponent.prototype.postSave=function(res, backOnSave){
    this.running = false;
    if (this.loading){
      this.loading.hideLoading();
    }
    var newMod = this.newMode;
    var successMsg = (newMod ? this.insertSuccessMsg : this.updateSuccessMsg);
    var x = res;
    if (!isNaN(x)){
      if (x > 0){
        this.succeed(successMsg, backOnSave);
      }
      else {
        if (newMod){
          this.handleDuplicateKey();
        }
        else {
          this.handleNotFound();
        }
      }
    }
    else {
      var result = x;
      if (result.status === edit_1.Status.Success){
        this.succeed(successMsg, backOnSave, result);
      }
      else if (result.status === edit_1.Status.Error){
        this.fail(result);
      }
      else if (result.status === edit_1.Status.DuplicateKey){
        if (newMod){
          this.handleDuplicateKey(result);
        }
        else {
          this.handleNotFound();
        }
      }
      else {
        var r = this.resourceService;
        var msg = edit_1.buildMessageFromStatusCode(result.status, r);
        var title = r.value('error');
        if (msg && msg.length > 0){
          this.showError(msg, title);
        }
        else if (result.message && result.message.length > 0){
          this.showError(result.message, title);
        }
        else {
          this.showError(r.value('error_internal'), title);
        }
      }
    }
  };
  EditComponent.prototype.handleDuplicateKey=function(result){
    var msg = core_2.message(this.resourceService, 'error_duplicate_key', 'error');
    this.showError(msg.message, msg.title);
  };
  return EditComponent;
}(BaseComponent));
exports.EditComponent = EditComponent;
var SearchComponent = (function(_super){
  __extends(SearchComponent, _super);
  function SearchComponent(){
    var _this = _super !== null && _super.apply(this, arguments) || this;
    _this.initPageSize = 20;
    _this.pageSize = 20;
    _this.pageIndex = 1;
    _this.itemTotal = 0;
    _this.pageTotal = 0;
    _this.showPaging = false;
    _this.append = false;
    _this.appendMode = false;
    _this.appendable = false;
    _this.initDisplayFields = false;
    _this.sequenceNo = 'sequenceNo';
    _this.triggerSearch = false;
    _this.pageMaxSize = 20;
    _this.pageSizes = [10, 20, 40, 60, 100, 200, 400, 1000];
    _this.xs = {};
    _this.state = _this.xs;
    _this.list = [];
    _this.chkAll = null;
    _this.searchable = true;
    _this.viewable = true;
    _this.addable = true;
    _this.editable = true;
    _this.approvable = true;
    _this.deletable = true;
    return _this;
  }
  SearchComponent.prototype.onCreated=function(service, resourceService, ui, getLocale, showMessage, showError, loading){
    this.state = {};
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
  };
  SearchComponent.prototype.toggleFilter=function(event){
    this.hideFilter = !this.hideFilter;
  };
  SearchComponent.prototype.mapToVModel=function(s){
    var _this = this;
    var keys = Object.keys(s);
    keys.forEach(function(key){ _this.$set(_this.$data, key, s[key]); });
  };
  SearchComponent.prototype.mergeSearchModel=function(obj, arrs, b){
    var s = search_utilities_1.mergeSearchModel(obj, this.pageSizes, arrs, b);
    this.mapToVModel(s);
    return s;
  };
  SearchComponent.prototype.load=function(s, auto){
    var com = this;
    var obj2 = search_utilities_1.initSearchable(s, com);
    this.setSearchModel(obj2);
    if (auto){
      setTimeout(function(){
        com.doSearch(true);
      }, 10);
    }
  };
  SearchComponent.prototype.setSearchForm=function(form){
    this.form = form;
  };
  SearchComponent.prototype.getSearchForm=function(){
    return this.form;
  };
  SearchComponent.prototype.setSearchModel=function(obj){
    this.state = obj;
  };
  SearchComponent.prototype.getOriginalSearchModel=function(){
    return this.state;
  };
  SearchComponent.prototype.getSearchModel=function(){
    var obj = this.populateSearchModel();
    return obj;
  };
  SearchComponent.prototype.populateSearchModel=function(){
    var obj2 = this.ui.decodeFromForm(this.getSearchForm(), this.getLocale(), this.getCurrencyCode());
    var obj = obj2 ? obj2 : {};
    var obj3 = search_utilities_1.optimizeSearchModel(obj, this, this.getDisplayFields());
    if (this.excluding){
      obj3.excluding = this.excluding;
    }
    return obj3;
  };
  SearchComponent.prototype.getDisplayFields=function(){
    if (this.displayFields){
      return this.displayFields;
    }
    if (!this.initDisplayFields){
      var f = this.getSearchForm();
      if (f){
        this.displayFields = search_utilities_1.getDisplayFields(f);
      }
      this.initDisplayFields = true;
    }
    return this.displayFields;
  };
  SearchComponent.prototype.onPageSizeChanged=function(event){
    var ctrl = event.currentTarget;
    this.pageSizeChanged(Number(ctrl.value), event);
  };
  SearchComponent.prototype.pageSizeChanged=function(size, event){
    search_utilities_1.changePageSize(this, size);
    this.tmpPageIndex = 1;
    this.doSearch();
  };
  SearchComponent.prototype.clearKeyword=function(event){
    if (event){
      event.preventDefault();
    }
    this.state.keyword = '';
  };
  SearchComponent.prototype.searchOnClick=function(event){
    if (event){
      event.preventDefault();
      if (!this.getSearchForm()){
        this.setSearchForm(event.target.form);
      }
    }
    this.resetAndSearch();
  };
  SearchComponent.prototype.resetAndSearch=function(){
    if (this.running === true){
      this.triggerSearch = true;
      return;
    }
    search_utilities_1.reset(this);
    this.tmpPageIndex = 1;
    this.doSearch();
  };
  SearchComponent.prototype.doSearch=function(isFirstLoad){
    var _this = this;
    var listForm = this.getSearchForm();
    if (listForm){
      this.ui.removeFormError(listForm);
    }
    var s = this.getSearchModel();
    var com = this;
    this.validateSearch(s, function(){
      if (com.running === true){
        return;
      }
      com.running = true;
      if (_this.loading){
        _this.loading.showLoading();
      }
      search_utilities_1.addParametersIntoUrl(s, isFirstLoad);
      com.search(s);
    });
  };
  SearchComponent.prototype.search=function(se){
    return __awaiter(this, void 0, void 0, function(){
      var result, err_4;
      return __generator(this, function(_a){
        switch (_a.label){
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4, this.service.search(se)];
          case 1:
            result = _a.sent();
            this.showResults(se, result);
            return [3, 3];
          case 2:
            err_4 = _a.sent();
            this.handleError(err_4);
            return [3, 3];
          case 3: return [2];
        }
      });
    });
  };
  SearchComponent.prototype.validateSearch=function(se, callback){
    var valid = true;
    var listForm = this.getSearchForm();
    if (listForm){
      valid = this.ui.validateForm(listForm, this.getLocale());
    }
    if (valid === true){
      callback();
    }
  };
  SearchComponent.prototype.searchError=function(err){
    this.pageIndex = this.tmpPageIndex;
    this.handleError(err);
  };
  SearchComponent.prototype.showResults=function(s, sr){
    var com = this;
    var results = sr.results;
    if (results != null && results.length > 0){
      var locale = this.getLocale();
      search_utilities_1.formatResults(results, this.formatter, locale, this.sequenceNo, this.pageIndex, this.pageSize, this.initPageSize);
    }
    var appendMode = com.appendMode;
    search_utilities_1.showResults(s, sr, com);
    if (appendMode === false){
      com.setList(results);
      com.tmpPageIndex = s.page;
      var r = this.resourceService;
      this.showMessage(search_utilities_1.buildSearchMessage(s, sr, r));
    }
    else {
      if (this.append === true && s.page > 1){
        search_utilities_1.append(this.getList(), results);
      }
      else {
        this.setList(results);
      }
    }
    this.running = false;
    if (this.loading){
      this.loading.hideLoading();
    }
    if (this.triggerSearch === true){
      this.triggerSearch = false;
      this.resetAndSearch();
    }
  };
  SearchComponent.prototype.setList=function(results){
    this.list = results;
  };
  SearchComponent.prototype.getList=function(){
    return this.list;
  };
  SearchComponent.prototype.sort=function(event){
    search_utilities_1.handleSortEvent(event, this);
    if (this.appendMode === false){
      this.doSearch();
    }
    else {
      this.resetAndSearch();
    }
  };
  SearchComponent.prototype.showMore=function(event){
    this.tmpPageIndex = this.pageIndex;
    search_utilities_1.more(this);
    this.doSearch();
  };
  SearchComponent.prototype.pageChanged=function(_a, event){
    var pageIndex = _a.pageIndex, itemsPerPage = _a.itemsPerPage;
    search_utilities_1.changePage(this, pageIndex, itemsPerPage);
    this.doSearch();
  };
  return SearchComponent;
}(BaseComponent));
exports.SearchComponent = SearchComponent;
