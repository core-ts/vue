"use strict";
var __extends = (this && this.__extends) || (function () {
  var extendStatics = function (d, b) {
    extendStatics = Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
      function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
  };
  return function (d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
    function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
  var _ = { label: 0, sent: function () { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
  function verb(n) { return function (v) { return step([n, v]); }; }
  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");
    while (_) try {
      if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
      if (y = 0, t) op = [op[0] & 2, t.value];
      switch (op[0]) {
        case 0: case 1: t = op; break;
        case 4: _.label++; return { value: op[1], done: false };
        case 5: _.label++; y = op[1]; op = [0]; continue;
        case 7: op = _.ops.pop(); _.trys.pop(); continue;
        default:
          if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
          if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
          if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
          if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
          if (t[2]) _.ops.pop();
          _.trys.pop(); continue;
      }
      op = body.call(thisArg, _);
    } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
    if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
  }
};
Object.defineProperty(exports, "__esModule", { value: true });
var vue_class_component_1 = require("vue-class-component");
var _1 = require(".");
var core_1 = require("./core");
var diff_1 = require("./diff");
var edit_1 = require("./edit");
var formatter_1 = require("./formatter");
var formutil_1 = require("./formutil");
var input_1 = require("./input");
var reflect_1 = require("./reflect");
var search_1 = require("./search");
exports.enLocale = {
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
var ViewComponent = (function (_super) {
  __extends(ViewComponent, _super);
  function ViewComponent(sv, param, showError, getLocale, loading, ignoreDate) {
    var _this = _super.call(this) || this;
    _this.resource = {};
    var resourceService = input_1.getResource(param);
    _this.getLocale = input_1.getLocaleFunc(param, getLocale);
    _this.showError = input_1.getErrorFunc(param, showError);
    _this.loading = input_1.getLoadingFunc(param, loading);
    if (sv) {
      if (typeof sv === 'function') {
        _this.loadData = sv;
      }
      else {
        _this.loadData = sv.load;
        if (sv.metadata) {
          var m = sv.metadata();
          if (m) {
            var meta = edit_1.build(m, ignoreDate);
            _this.keys = meta.keys;
          }
        }
      }
    }
    _this.loading = loading;
    _this.resource = resourceService.resource();
    _this.bindFunctions = _this.bindFunctions.bind(_this);
    _this.bindFunctions();
    return _this;
  }
  ViewComponent.prototype.onCreated = function (sv, param, showError, getLocale, loading, ignoreDate) {
    var resourceService = input_1.getResource(param);
    this.getLocale = input_1.getLocaleFunc(param, getLocale);
    this.showError = input_1.getErrorFunc(param, showError);
    this.loading = input_1.getLoadingFunc(param, loading);
    if (sv) {
      if (typeof sv === 'function') {
        this.loadData = sv;
      }
      else {
        this.loadData = sv.load;
        if (sv.metadata) {
          var m = sv.metadata();
          if (m) {
            var meta = edit_1.build(m, ignoreDate);
            this.keys = meta.keys;
          }
        }
      }
    }
    this.loading = loading;
    this.resource = resourceService.resource();
    this.bindFunctions = this.bindFunctions.bind(this);
    this.bindFunctions();
  };
  ViewComponent.prototype.bindFunctions = function () {
    this.getModelName = this.getModelName.bind(this);
    this.back = this.back.bind(this);
    this.handleError = this.handleError.bind(this);
    this.load = this.load.bind(this);
    this.handleNotFound = this.handleNotFound.bind(this);
    this.getModelName = this.getModelName.bind(this);
    this.showModel = this.showModel.bind(this);
    this.getModel = this.getModel.bind(this);
  };
  ViewComponent.prototype.back = function (e) {
    if (e) {
      e.preventDefault();
    }
    window.history.back();
  };
  ViewComponent.prototype.handleError = function (err) {
    this.running = false;
    if (this.loading) {
      this.loading.hideLoading();
    }
    var r = this.resource;
    var title = r['error'];
    var msg = r['error_internal'];
    if (!err) {
      this.showError(msg, title);
      return;
    }
    var data = err && err.response ? err.response : err;
    if (data) {
      var status_1 = data.status;
      if (status_1 && !isNaN(status_1)) {
        msg = core_1.messageByHttpStatus(status_1, r);
      }
      if (status_1 === 403) {
        msg = r['error_forbidden'];
        this.showError(msg, title);
      }
      else if (status_1 === 401) {
        msg = r['error_unauthorized'];
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
  ViewComponent.prototype.load = function (_id, callback) {
    var id = _id;
    if (id && id !== '') {
      this.running = true;
      core_1.showLoading(this.loading);
      var com_1 = this;
      if (this.loadData) {
        this.loadData(id).then(function (obj) {
          if (obj) {
            if (callback) {
              callback(obj, com_1.showModel);
            }
            else {
              com_1.showModel(obj);
            }
          }
          else {
            com_1.handleNotFound(com_1.form);
          }
          com_1.running = false;
          core_1.hideLoading(com_1.loading);
        }).catch(function (err) {
          var data = (err && err.response) ? err.response : err;
          if (data && data.status === 404) {
            com_1.handleNotFound(com_1.form);
          }
          else {
            core_1.error(err, com_1.resource, com_1.showError);
          }
          com_1.running = false;
          core_1.hideLoading(com_1.loading);
        });
      }
    }
  };
  ViewComponent.prototype.handleNotFound = function (form) {
    var msg = core_1.message(this.resource, 'error_not_found', 'error');
    if (this.form) {
      formutil_1.readOnly(this.form);
    }
    this.showError(msg.message, msg.title);
  };
  ViewComponent.prototype.getModelName = function () {
    if (this.name && this.name.length > 0) {
      return this.name;
    }
    var n = core_1.getModelName(this.form);
    if (n && n.length > 0) {
      return n;
    }
    else {
      return 'model';
    }
  };
  ViewComponent.prototype.showModel = function (model) {
    var name = this.getModelName();
    this[name] = model;
  };
  ViewComponent.prototype.getModel = function () {
    var name = this.getModelName();
    var model = this[name];
    return model;
  };
  return ViewComponent;
}(vue_class_component_1.Vue));
exports.ViewComponent = ViewComponent;
var BaseComponent = (function (_super) {
  __extends(BaseComponent, _super);
  function BaseComponent(showError) {
    var _this = _super.call(this) || this;
    _this.includingCurrencySymbol = false;
    _this.resource = {};
    _this.running = false;
    _this.showError = showError;
    return _this;
  }
  BaseComponent.prototype.currencySymbol = function () {
    return this.includingCurrencySymbol;
  };
  BaseComponent.prototype.getCurrencyCode = function () {
    if (this.form) {
      var x = this.form.getAttribute('currency-code');
      if (x) {
        return x;
      }
    }
    return undefined;
  };
  BaseComponent.prototype.back = function (e) {
    if (e) {
      e.preventDefault();
    }
    window.history.back();
  };
  BaseComponent.prototype.handleError = function (err) {
    this.running = false;
    if (this.loading) {
      this.loading.hideLoading();
    }
    var r = this.resource;
    var title = r['error'];
    var msg = r['error_internal'];
    if (!err) {
      this.showError(msg, title);
      return;
    }
    var data = err && err.response ? err.response : err;
    if (data) {
      var status_2 = data.status;
      if (status_2 && !isNaN(status_2)) {
        msg = core_1.messageByHttpStatus(status_2, r);
      }
      if (status_2 === 403) {
        msg = r['error_forbidden'];
        formutil_1.readOnly(this.form);
        this.showError(msg, title);
      }
      else if (status_2 === 401) {
        msg = r['error_unauthorized'];
        formutil_1.readOnly(this.form);
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
  BaseComponent.prototype.getModelName = function () {
    var n = core_1.getModelName(this.form);
    if (!n || n.length === 0) {
      return 'model';
    }
    else {
      return n;
    }
  };
  BaseComponent.prototype.includes = function (checkedList, v) {
    return v && checkedList && Array.isArray(checkedList) ? checkedList.includes(v) : false;
  };
  BaseComponent.prototype.updateState = function (event) {
    var locale = exports.enLocale;
    if (this.getLocale) {
      locale = this.getLocale();
    }
    this.updateStateFlat(event, locale);
  };
  BaseComponent.prototype.updateStateFlat = function (e, locale) {
    if (!locale) {
      locale = exports.enLocale;
    }
    var ctrl = e.currentTarget;
    var modelName = this.getModelName();
    if (!modelName && ctrl.form) {
      modelName = ctrl.form.getAttribute('model-name');
    }
    var type = ctrl.getAttribute('type');
    var isPreventDefault = type && (['checkbox', 'radio'].indexOf(type.toLowerCase()) >= 0 ? false : true);
    if (isPreventDefault) {
      e.preventDefault();
    }
    if (this.uiS1 && ctrl.nodeName === 'SELECT' && ctrl.value && ctrl.classList.contains('invalid')) {
      this.uiS1.removeError(ctrl);
    }
    if (modelName) {
      var ex = this[modelName];
      var dataField = ctrl.getAttribute('data-field');
      var field = (dataField ? dataField : ctrl.name);
      if (type && type.toLowerCase() === 'checkbox') {
        var v = valueOfCheckbox(ctrl);
        reflect_1.setValue(ex, field, v);
      }
      else {
        var v = ctrl.value;
        if (this.uiS1) {
          v = this.uiS1.getValue(ctrl, locale);
        }
        if (ctrl.value != v) {
          reflect_1.setValue(ex, field, v);
        }
      }
    }
  };
  return BaseComponent;
}(vue_class_component_1.Vue));
exports.BaseComponent = BaseComponent;
function valueOfCheckbox(ctrl) {
  var ctrlOnValue = ctrl.getAttribute('data-on-value');
  var ctrlOffValue = ctrl.getAttribute('data-off-value');
  if (ctrlOnValue && ctrlOffValue) {
    var onValue = ctrlOnValue ? ctrlOnValue : true;
    var offValue = ctrlOffValue ? ctrlOffValue : false;
    return ctrl.checked === true ? onValue : offValue;
  }
  else {
    return ctrl.checked === true;
  }
}
exports.valueOfCheckbox = valueOfCheckbox;
var EditComponent = (function (_super) {
  __extends(EditComponent, _super);
  function EditComponent(service, param, showMessage, showError, confirm, getLocale, ui, loading, status, patchable, ignoreDate, backOnSaveSuccess) {
    var _this = _super.call(this, showError) || this;
    _this.newMode = false;
    _this.setBack = false;
    _this.patchable = true;
    _this.backOnSuccess = true;
    _this.addable = true;
    _this.editable = true;
    _this.insertSuccessMsg = '';
    _this.updateSuccessMsg = '';
    var resourceService = input_1.getResource(param);
    _this.resource = resourceService.resource();
    _this.getLocale = input_1.getLocaleFunc(param, getLocale);
    _this.loading = input_1.getLoadingFunc(param, loading);
    _this.ui = input_1.getUIService(param, ui);
    _this.showError = input_1.getErrorFunc(param, showError);
    _this.showMessage = input_1.getMsgFunc(param, showMessage);
    _this.confirm = input_1.getConfirmFunc(param, confirm);
    _this.status = input_1.getEditStatusFunc(param, status);
    if (!_this.status) {
      _this.status = core_1.createEditStatus(_this.status);
    }
    if (service.metadata) {
      var metadata = service.metadata();
      if (metadata) {
        var meta = edit_1.build(metadata, ignoreDate);
        _this.keys = meta.keys;
        _this.version = meta.version;
        _this.metadata = metadata;
        _this.metamodel = meta;
      }
    }
    if (!_this.keys && service.keys) {
      var k = service.keys();
      if (k) {
        _this.keys = k;
      }
    }
    if (!_this.keys) {
      _this.keys = [];
    }
    if (patchable === false) {
      _this.patchable = patchable;
    }
    if (backOnSaveSuccess === false) {
      _this.backOnSuccess = backOnSaveSuccess;
    }
    _this.insertSuccessMsg = _this.resource['msg_save_success'];
    _this.updateSuccessMsg = _this.resource['msg_save_success'];
    _this.service = service;
    _this.showMessage = showMessage;
    _this.confirm = confirm;
    _this.ui = ui;
    _this.getLocale = getLocale;
    _this.showError = showError;
    _this.loading = loading;
    _this.bindFunctions = _this.bindFunctions.bind(_this);
    _this.bindFunctions();
    return _this;
  }
  EditComponent.prototype.onCreated = function (service, param, showMessage, showError, confirm, getLocale, ui, loading, status, patchable, ignoreDate, backOnSaveSuccess) {
    var resourceService = input_1.getResource(param);
    this.resource = resourceService.resource();
    this.getLocale = input_1.getLocaleFunc(param, getLocale);
    this.loading = input_1.getLoadingFunc(param, loading);
    this.ui = input_1.getUIService(param, ui);
    this.showError = input_1.getErrorFunc(param, showError);
    this.showMessage = input_1.getMsgFunc(param, showMessage);
    this.confirm = input_1.getConfirmFunc(param, confirm);
    this.status = input_1.getEditStatusFunc(param, status);
    if (!this.status) {
      this.status = core_1.createEditStatus(this.status);
    }
    if (service.metadata) {
      var metadata = service.metadata();
      if (metadata) {
        var meta = edit_1.build(metadata, ignoreDate);
        this.keys = meta.keys;
        this.version = meta.version;
        this.metadata = metadata;
        this.metamodel = meta;
      }
    }
    if (!this.keys && service.keys) {
      var k = service.keys();
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
    this.showMessage = showMessage;
    this.confirm = confirm;
    this.ui = ui;
    this.getLocale = getLocale;
    this.showError = showError;
    this.loading = loading;
    this.bindFunctions = this.bindFunctions.bind(this);
    this.bindFunctions();
  };
  EditComponent.prototype.bindFunctions = function () {
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
  };
  EditComponent.prototype.load = function (_id, callback) {
    var id = _id;
    if (id && id !== '') {
      var com_2 = this;
      this.service.load(id).then(function (obj) {
        if (!obj) {
          com_2.handleNotFound(com_2.form);
        }
        else {
          com_2.newMode = false;
          com_2.orginalModel = reflect_1.clone(obj);
          com_2.formatModel(obj);
          if (callback) {
            callback(obj, com_2.showModel);
          }
          else {
            com_2.showModel(obj);
          }
        }
        com_2.running = false;
        core_1.hideLoading(com_2.loading);
      }).catch(function (err) {
        var data = (err && err.response) ? err.response : err;
        if (data && data.status === 404) {
          com_2.handleNotFound(com_2.form);
        }
        else {
          core_1.error(err, com_2.resource, com_2.showError);
        }
        com_2.running = false;
        core_1.hideLoading(com_2.loading);
      });
    }
    else {
      this.newMode = true;
      this.orginalModel = undefined;
      var obj = this.createModel();
      if (callback) {
        callback(obj, this.showModel);
      }
      else {
        this.showModel(obj);
      }
    }
  };
  EditComponent.prototype.resetState = function (newMod, model, originalModel) {
    this.newMode = newMod;
    this.orginalModel = originalModel;
    this.formatModel(model);
    this.showModel(model);
  };
  EditComponent.prototype.handleNotFound = function (form) {
    if (form) {
      formutil_1.readOnly(form);
    }
    var r = this.resource;
    var title = r['error'];
    var msg = r['error_not_found'];
    this.showError(title, msg);
  };
  EditComponent.prototype.formatModel = function (obj) {
    if (this.metamodel) {
      var locale = exports.enLocale;
      if (this.getLocale) {
        locale = this.getLocale();
      }
      formatter_1.format(obj, this.metamodel, locale, this.getCurrencyCode(), this.currencySymbol());
    }
  };
  EditComponent.prototype.getModelName = function () {
    if (this.name && this.name.length > 0) {
      return this.name;
    }
    var n = core_1.getModelName(this.form);
    if (!n || n.length === 0) {
      return 'model';
    }
    else {
      return n;
    }
  };
  EditComponent.prototype.showModel = function (model) {
    var n = this.getModelName();
    this[n] = model;
  };
  EditComponent.prototype.getRawModel = function () {
    var name = this.getModelName();
    var model = this[name];
    return model;
  };
  EditComponent.prototype.getModel = function () {
    var name = this.getModelName();
    var model = this[name];
    var obj = reflect_1.clone(model);
    if (this.metamodel) {
      var locale = exports.enLocale;
      if (this.getLocale) {
        locale = this.getLocale();
      }
      formatter_1.json(obj, this.metamodel, locale, this.getCurrencyCode());
    }
    return obj;
  };
  EditComponent.prototype.createModel = function () {
    if (this.service.metadata) {
      var metadata = this.service.metadata();
      if (metadata) {
        var obj = edit_1.createModel(metadata);
        return obj;
      }
    }
    var obj2 = {};
    return obj2;
  };
  EditComponent.prototype.create = function (event) {
    if (!this.form && event && event.currentTarget) {
      var ctrl = event.currentTarget;
      if (ctrl.form) {
        this.form = ctrl.form;
      }
    }
    this.resetState(true, this.createModel(), undefined);
    var u = this.ui;
    var f = this.form;
    if (u && f) {
      setTimeout(function () {
        u.removeFormError(f);
      }, 60);
    }
  };
  EditComponent.prototype.save = function (event, isBack) {
    if (!this.form && event && event.currentTarget) {
      this.form = event.currentTarget.form;
    }
    if (isBack) {
      this.onSave(isBack);
    }
    else {
      this.onSave(this.backOnSuccess);
    }
  };
  EditComponent.prototype.onSave = function (isBack) {
    var _this = this;
    var r = this.resource;
    var newMod = this.newMode;
    if (newMod === true && this.addable === true) {
      var m = core_1.message(r, 'error_permission_add', 'error_permission');
      this.showError(m.message, m.title);
      return;
    }
    else if (this.newMode === false && this.editable === false) {
      var msg = core_1.message(r, 'error_permission_edit', 'error_permission');
      this.showError(msg.message, msg.title);
      return;
    }
    else {
      if (this.running === true) {
        return;
      }
      var com_3 = this;
      var obj_1 = com_3.getModel();
      if (!newMod) {
        var diffObj_1 = reflect_1.makeDiff(this.orginalModel, obj_1, this.keys, this.version);
        var l = Object.keys(diffObj_1).length;
        if (l === 0) {
          this.showMessage(r['msg_no_change']);
        }
        else {
          com_3.validate(obj_1, function () {
            var msg = core_1.message(r, 'msg_confirm_save', 'confirm', 'yes', 'no');
            _this.confirm(msg.message, msg.title, function () {
              com_3.doSave(obj_1, diffObj_1, isBack);
            }, msg.no, msg.yes);
          });
        }
      }
      else {
        com_3.validate(obj_1, function () {
          var msg = core_1.message(r, 'msg_confirm_save', 'confirm', 'yes', 'no');
          _this.confirm(msg.message, msg.title, function () {
            com_3.doSave(obj_1, obj_1, isBack);
          }, msg.no, msg.yes);
        });
      }
    }
  };
  EditComponent.prototype.validate = function (obj, callback) {
    if (this.ui) {
      var locale = exports.enLocale;
      if (this.getLocale) {
        locale = this.getLocale();
      }
      var valid = this.ui.validateForm(this.form, locale);
      if (valid) {
        callback(obj);
      }
    }
    else {
      callback(obj);
    }
  };
  EditComponent.prototype.doSave = function (obj, body, isBack) {
    return __awaiter(this, void 0, void 0, function () {
      var isBackO, com;
      var _this = this;
      return __generator(this, function (_a) {
        this.running = true;
        if (this.loading) {
          this.loading.showLoading();
        }
        isBackO = (isBack == null || isBack === undefined ? this.backOnSuccess : isBack);
        com = this;
        if (!this.newMode) {
          if (this.service.patch && this.patchable === true && body && Object.keys(body).length > 0) {
            this.service.patch(body).then(function (result) { return com.postSave(result, isBackO); }).catch(function (err) { return _this.handleError(err); });
          }
          else {
            this.service.update(obj).then(function (result) { return com.postSave(result, isBackO); }).catch(function (err) { return _this.handleError(err); });
          }
        }
        else {
          reflect_1.trim(obj);
          this.service.insert(obj).then(function (result) { return com.postSave(result, isBackO); }).catch(function (err) { return _this.handleError(err); });
        }
        return [2];
      });
    });
  };
  EditComponent.prototype.succeed = function (msg, backOnSave, result) {
    if (result) {
      var model = result.value;
      this.newMode = false;
      if (model && this.setBack === true) {
        if (!this.backOnSuccess) {
          this.resetState(false, model, reflect_1.clone(model));
        }
      }
      else {
        edit_1.handleVersion(this.getRawModel(), this.version);
      }
    }
    else {
      edit_1.handleVersion(this.getRawModel(), this.version);
    }
    this.showMessage(msg);
    if (backOnSave) {
      this.back();
    }
  };
  EditComponent.prototype.fail = function (result) {
    var errors = result.errors;
    var f = this.form;
    var u = this.ui;
    var unmappedErrors = u.showFormError(f, errors);
    formutil_1.focusFirstError(f);
    if (!result.message) {
      if (errors && errors.length === 1) {
        result.message = errors[0].message;
      }
      else {
        result.message = u.buildErrorMessage(unmappedErrors);
      }
    }
    var title = this.resource['error'];
    this.showError(result.message ? result.message : 'Error', title);
  };
  EditComponent.prototype.postSave = function (res, backOnSave) {
    this.running = false;
    if (this.loading) {
      this.loading.hideLoading();
    }
    var st = this.status;
    var newMod = this.newMode;
    var successMsg = (newMod ? this.insertSuccessMsg : this.updateSuccessMsg);
    var x = res;
    if (!isNaN(x)) {
      if (x > 0) {
        this.succeed(successMsg, backOnSave);
      }
      else {
        if (newMod) {
          this.handleDuplicateKey();
        }
        else {
          this.handleNotFound();
        }
      }
    }
    else {
      var result = x;
      if (result.status === 1) {
        this.succeed(successMsg, backOnSave, result);
      }
      else if (result.status === 2) {
        this.fail(result);
      }
      else if (result.status === 0) {
        if (newMod) {
          this.handleDuplicateKey(result);
        }
        else {
          this.handleNotFound();
        }
      }
      else {
        edit_1.handleStatus(result.status, st, this.resource, this.showError);
      }
    }
  };
  EditComponent.prototype.handleDuplicateKey = function (result) {
    var msg = core_1.message(this.resource, 'error_duplicate_key', 'error');
    this.showError(msg.message, msg.title);
  };
  return EditComponent;
}(BaseComponent));
exports.EditComponent = EditComponent;
var SearchComponent = (function (_super) {
  __extends(SearchComponent, _super);
  function SearchComponent(sv, param, showMessage, showError, getLocale, uis, loading) {
    var _this = _super.call(this, input_1.getErrorFunc(param, showError)) || this;
    _this.initPageSize = 20;
    _this.pageSize = 20;
    _this.pageIndex = 1;
    _this.itemTotal = 0;
    _this.pageTotal = 0;
    _this.showPaging = false;
    _this.append = false;
    _this.appendMode = false;
    _this.appendable = false;
    _this.initFields = false;
    _this.sequenceNo = 'sequenceNo';
    _this.triggerSearch = false;
    _this.pageMaxSize = 20;
    _this.pageSizes = [10, 20, 40, 60, 100, 200, 400, 1000];
    _this.filter = {};
    _this.list = [];
    _this.chkAll = null;
    _this.searchable = true;
    _this.viewable = true;
    _this.addable = true;
    _this.editable = true;
    _this.approvable = true;
    _this.deletable = true;
    _this.filter = {};
    if (typeof sv === 'function') {
      _this.searchFn = sv;
    }
    else {
      _this.searchFn = sv.search;
      if (sv.keys) {
        _this.keys = sv.keys();
      }
    }
    _this.ui = input_1.getUIService(param, uis);
    _this.showError = input_1.getErrorFunc(param, showError);
    _this.showMessage = input_1.getMsgFunc(param, showMessage);
    _this.getLocale = getLocale;
    _this.loading = loading;
    var resourceService = input_1.getResource(param);
    _this.resource = resourceService.resource();
    _this.resourceService = resourceService;
    _this.deleteHeader = resourceService.value('msg_delete_header');
    _this.deleteConfirm = resourceService.value('msg_delete_confirm');
    _this.deleteFailed = resourceService.value('msg_delete_failed');
    _this.bindFunctions = _this.bindFunctions.bind(_this);
    _this.bindFunctions();
    return _this;
  }
  SearchComponent.prototype.onCreated = function (sv, param, showMessage, showError, getLocale, uis, loading) {
    this.filter = {};
    if (typeof sv === 'function') {
      this.searchFn = sv;
    }
    else {
      this.searchFn = sv.search;
      if (sv.keys) {
        this.keys = sv.keys();
      }
    }
    this.ui = input_1.getUIService(param, uis);
    this.showError = input_1.getErrorFunc(param, showError);
    this.showMessage = input_1.getMsgFunc(param, showMessage);
    this.getLocale = getLocale;
    this.loading = loading;
    var resourceService = input_1.getResource(param);
    this.resource = resourceService.resource();
    this.resourceService = resourceService;
    this.deleteHeader = resourceService.value('msg_delete_header');
    this.deleteConfirm = resourceService.value('msg_delete_confirm');
    this.deleteFailed = resourceService.value('msg_delete_failed');
    this.bindFunctions = this.bindFunctions.bind(this);
    this.bindFunctions();
  };
  SearchComponent.prototype.bindFunctions = function () {
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
  };
  SearchComponent.prototype.changeView = function (event, view) {
    if (view && view.length > 0) {
      this.view = view;
    }
    else if (event && event.target) {
      var target = event.target;
      var v = target.getAttribute('data-view');
      if (v && v.length > 0) {
        this.view = v;
      }
    }
  };
  SearchComponent.prototype.toggleFilter = function (event) {
    var x = !this.hideFilter;
    core_1.handleToggle(event.target, this.hideFilter);
    this.hideFilter = !this.hideFilter;
  };
  SearchComponent.prototype.mapToVModel = function (s) {
    var _this = this;
    var keys = Object.keys(s);
    keys.forEach(function (key) {
      _this[key] = s[key];
    });
  };
  SearchComponent.prototype.mergeFilter = function (obj, arrs, b) {
    var s = search_1.mergeFilter(obj, b, arrs, this.pageSizes);
    this.mapToVModel(s);
    return s;
  };
  SearchComponent.prototype.load = function (s, auto) {
    var com = this;
    var obj2 = search_1.initFilter(s, com);
    com.setFilter(obj2);
    if (auto) {
      setTimeout(function () {
        com.onSearch(true);
      }, 10);
    }
  };
  SearchComponent.prototype.setSearchForm = function (form) {
    this.form = form;
  };
  SearchComponent.prototype.getSearchForm = function () {
    return this.form;
  };
  SearchComponent.prototype.setFilter = function (obj) {
    this.filter = obj;
  };
  SearchComponent.prototype.getOriginalFilter = function () {
    return this.filter;
  };
  SearchComponent.prototype.getFilter = function () {
    var locale;
    if (this.getLocale) {
      locale = this.getLocale();
    }
    var sf = this.getSearchForm();
    var obj4 = this.filter;
    if (this.ui && sf) {
      var obj2 = this.ui.decodeFromForm(sf, locale, this.getCurrencyCode());
      obj4 = obj2 ? obj2 : {};
    }
    var obj3 = search_1.optimizeFilter(obj4, this, this.getFields());
    if (this.excluding) {
      obj3.excluding = this.excluding;
    }
    return obj3;
  };
  SearchComponent.prototype.getFields = function () {
    if (this.fields) {
      return this.fields;
    }
    if (!this.initFields) {
      var f = this.getSearchForm();
      if (f) {
        this.fields = search_1.getFields(f);
      }
      this.initFields = true;
    }
    return this.fields;
  };
  SearchComponent.prototype.onPageSizeChanged = function (event) {
    var ctrl = event.currentTarget;
    this.pageSizeChanged(Number(ctrl.value), event);
  };
  SearchComponent.prototype.pageSizeChanged = function (size, event) {
    search_1.changePageSize(this, size);
    this.tmpPageIndex = 1;
    this.onSearch();
  };
  SearchComponent.prototype.clear = function (event) {
    if (event) {
      event.preventDefault();
    }
    this.filter.q = '';
  };
  SearchComponent.prototype.search = function (event) {
    if (event) {
      event.preventDefault();
      if (!this.getSearchForm()) {
        this.setSearchForm(event.target.form);
      }
    }
    this.resetAndSearch();
  };
  SearchComponent.prototype.resetAndSearch = function () {
    if (this.running === true) {
      this.triggerSearch = true;
      return;
    }
    search_1.reset(this);
    this.tmpPageIndex = 1;
    this.onSearch();
  };
  SearchComponent.prototype.onSearch = function (isFirstLoad) {
    var com = this;
    var listForm = com.getSearchForm();
    if (listForm && com.ui) {
      com.ui.removeFormError(listForm);
    }
    var s = com.getFilter();
    com.validateSearch(s, function () {
      if (com.running === true) {
        return;
      }
      com.running = true;
      if (com.loading) {
        com.loading.showLoading();
      }
      search_1.addParametersIntoUrl(s, isFirstLoad);
      com.doSearch(s);
    });
  };
  SearchComponent.prototype.doSearch = function (ft) {
    var s = reflect_1.clone(ft);
    var page = this.pageIndex;
    if (!page || page < 1) {
      page = 1;
    }
    var offset;
    if (ft.limit) {
      if (ft.firstLimit && ft.firstLimit > 0) {
        offset = ft.limit * (page - 2) + ft.firstLimit;
      }
      else {
        offset = ft.limit * (page - 1);
      }
    }
    var limit = (page <= 1 && ft.firstLimit && ft.firstLimit > 0 ? ft.firstLimit : ft.limit);
    var next = (this.nextPageToken && this.nextPageToken.length > 0 ? this.nextPageToken : offset);
    var fields = ft.fields;
    delete ft['page'];
    delete ft['fields'];
    delete ft['limit'];
    delete ft['firstLimit'];
    var com = this;
    com.searchFn(ft, limit, next, fields).then(function (result) {
      com.showResults(s, result);
    }).catch(function (err) {
      com.handleError(err);
    });
  };
  SearchComponent.prototype.validateSearch = function (se, callback) {
    var valid = true;
    var listForm = this.getSearchForm();
    if (listForm) {
      var locale = exports.enLocale;
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
  };
  SearchComponent.prototype.searchError = function (response) {
    if (this.tmpPageIndex) {
      this.pageIndex = this.tmpPageIndex;
    }
    core_1.error(response, this.resource, this.showError);
  };
  SearchComponent.prototype.showResults = function (s, sr) {
    var com = this;
    var results = sr.list;
    if (results != null && results.length > 0) {
      var locale = exports.enLocale;
      if (this.getLocale) {
        locale = this.getLocale();
      }
      search_1.formatResults(results, this.pageIndex, this.pageSize, this.initPageSize, this.sequenceNo, this.format, locale);
    }
    var appendMode = com.appendMode;
    com.pageIndex = (s.page && s.page >= 1 ? s.page : 1);
    if (sr.total) {
      com.itemTotal = sr.total;
    }
    if (appendMode) {
      var limit = s.limit;
      if ((!s.page || s.page <= 1) && s.firstLimit && s.firstLimit > 0) {
        limit = s.firstLimit;
      }
      com.nextPageToken = sr.nextPageToken;
      if (this.append && (s.page && s.page > 1)) {
        search_1.append(this.getList(), results);
      }
      else {
        this.setList(results);
      }
    }
    else {
      search_1.showPaging(com, sr.list, s.limit, sr.total);
      com.setList(results);
      com.tmpPageIndex = s.page;
      if (s.limit) {
        this.showMessage(search_1.buildMessage(this.resourceService, s.page, s.limit, sr.list, sr.total));
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
  };
  SearchComponent.prototype.setList = function (results) {
    this.list = results;
  };
  SearchComponent.prototype.getList = function () {
    return this.list;
  };
  SearchComponent.prototype.sort = function (event) {
    search_1.handleSortEvent(event, this);
    if (this.appendMode === false) {
      this.onSearch();
    }
    else {
      this.resetAndSearch();
    }
  };
  SearchComponent.prototype.showMore = function (event) {
    this.tmpPageIndex = this.pageIndex;
    search_1.more(this);
    this.onSearch();
  };
  SearchComponent.prototype.pageChanged = function (p, event) {
    search_1.changePage(this, p.pageIndex, p.itemsPerPage);
    this.onSearch();
  };
  return SearchComponent;
}(BaseComponent));
exports.SearchComponent = SearchComponent;
var DiffApprComponent = (function (_super) {
  __extends(DiffApprComponent, _super);
  function DiffApprComponent(service, param, showMessage, showError, loading, status) {
    var _this = _super.call(this) || this;
    _this.resource = {};
    _this.service = service;
    var resourceService = input_1.getResource(param);
    _this.resource = resourceService.resource();
    _this.loading = input_1.getLoadingFunc(param, loading);
    _this.showError = input_1.getErrorFunc(param, showError);
    _this.showMessage = input_1.getMsgFunc(param, showMessage);
    _this.status = input_1.getDiffStatusFunc(param, status);
    if (!_this.status) {
      _this.status = _1.createDiffStatus(_this.status);
    }
    var x = {};
    _this.origin = x;
    _this.value = x;
    _this.bindFunctions = _this.bindFunctions.bind(_this);
    _this.bindFunctions();
    return _this;
  }
  DiffApprComponent.prototype.onCreated = function (service, param, showMessage, showError, loading, status) {
    this.service = service;
    var resourceService = input_1.getResource(param);
    this.resource = resourceService.resource();
    this.loading = input_1.getLoadingFunc(param, loading);
    this.showError = input_1.getErrorFunc(param, showError);
    this.showMessage = input_1.getMsgFunc(param, showMessage);
    this.status = input_1.getDiffStatusFunc(param, status);
    if (!this.status) {
      this.status = _1.createDiffStatus(this.status);
    }
    this.bindFunctions = this.bindFunctions.bind(this);
    this.bindFunctions();
  };
  DiffApprComponent.prototype.bindFunctions = function () {
    this.back = this.back.bind(this);
    this.load = this.load.bind(this);
    this.handleNotFound = this.handleNotFound.bind(this);
    this.formatFields = this.formatFields.bind(this);
    this.approve = this.approve.bind(this);
    this.reject = this.reject.bind(this);
    this.handleError = this.handleError.bind(this);
    this.alertError = this.alertError.bind(this);
    this.end = this.end.bind(this);
  };
  DiffApprComponent.prototype.back = function () {
    window.history.back();
  };
  DiffApprComponent.prototype.load = function (_id) {
    var x = _id;
    if (x && x !== '') {
      this.id = _id;
      this.running = true;
      core_1.showLoading(this.loading);
      var com_4 = this;
      this.service.diff(_id).then(function (dobj) {
        if (!dobj) {
          com_4.handleNotFound(com_4.form);
        }
        else {
          var formatdDiff = diff_1.formatDiffModel(dobj, com_4.formatFields);
          com_4.value = formatdDiff.value;
          com_4.origin = formatdDiff.origin;
          if (com_4.form) {
            diff_1.showDiff(com_4.form, formatdDiff.value, formatdDiff.origin);
          }
        }
        com_4.running = false;
        core_1.hideLoading(com_4.loading);
      }).catch(function (err) {
        var data = (err && err.response) ? err.response : err;
        if (data && data.status === 404) {
          com_4.handleNotFound(com_4.form);
        }
        else {
          core_1.error(err, com_4.resource, com_4.showError);
        }
        com_4.running = false;
        core_1.hideLoading(com_4.loading);
      });
    }
  };
  DiffApprComponent.prototype.handleNotFound = function (form) {
    this.disabled = true;
    this.alertError(this.resource.error_not_found);
  };
  DiffApprComponent.prototype.formatFields = function (value) {
    return value;
  };
  DiffApprComponent.prototype.approve = function (event) {
    event.preventDefault();
    if (this.running) {
      return;
    }
    var com = this;
    var st = this.status;
    var r = this.resource;
    if (this.id) {
      this.running = true;
      core_1.showLoading(this.loading);
      this.service.approve(this.id).then(function (status) {
        if (status === st.success) {
          com.showMessage(r['msg_approve_success']);
        }
        else if (status === st.version_error) {
          com.showMessage(r['msg_approve_version_error']);
        }
        else if (status === st.not_found) {
          com.handleNotFound(com.form);
        }
        else {
          com.showError(r['error_internal'], r['error']);
        }
        com.end();
      }).catch(function (err) {
        com.handleError(err);
        com.end();
      });
    }
  };
  DiffApprComponent.prototype.end = function () {
    this.disabled = true;
    this.running = false;
    core_1.hideLoading(this.loading);
  };
  DiffApprComponent.prototype.reject = function (event) {
    event.preventDefault();
    if (this.running) {
      return;
    }
    var com = this;
    var st = this.status;
    var r = this.resource;
    if (this.id) {
      this.running = true;
      core_1.showLoading(this.loading);
      this.service.reject(this.id).then(function (status) {
        if (status === st.success) {
          com.showMessage(r['msg_reject_success']);
        }
        else if (status === st.version_error) {
          com.showMessage(r['msg_approve_version_error']);
        }
        else if (status === st.not_found) {
          com.handleNotFound(com.form);
        }
        else {
          com.showError(r['error_internal'], r['error']);
        }
        com.end();
      }).catch(function (err) {
        com.handleError(err);
        com.end();
      });
    }
  };
  DiffApprComponent.prototype.handleError = function (err) {
    var r = this.resource;
    var data = (err && err.response) ? err.response : err;
    if (data && (data.status === 404 || data.status === 409)) {
      if (data.status === 404) {
        this.handleNotFound();
      }
      else {
        this.showMessage(r['msg_approve_version_error']);
      }
    }
    else {
      core_1.error(err, r, this.showError);
    }
  };
  DiffApprComponent.prototype.alertError = function (msg) {
    var title = this.resource['error'];
    this.showError(msg, title);
  };
  return DiffApprComponent;
}(vue_class_component_1.Vue));
exports.DiffApprComponent = DiffApprComponent;
