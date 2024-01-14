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
Object.defineProperty(exports, "__esModule", { value: true });
var vue_class_component_1 = require("vue-class-component");
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
  function ViewComponent() {
    var _this = _super !== null && _super.apply(this, arguments) || this;
    _this.resource = {};
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
  function BaseComponent() {
    var _this = _super !== null && _super.apply(this, arguments) || this;
    _this.includingCurrencySymbol = false;
    _this.resource = {};
    _this.running = false;
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
  function EditComponent() {
    var _this = _super !== null && _super.apply(this, arguments) || this;
    _this.newMode = false;
    _this.setBack = false;
    _this.patchable = true;
    _this.backOnSuccess = true;
    _this.insertSuccessMsg = '';
    _this.updateSuccessMsg = '';
    return _this;
  }
  EditComponent.prototype.onCreated = function (service, param, showMessage, showError, confirm, getLocale, uis, loading, patchable, ignoreDate, backOnSaveSuccess) {
    var resourceService = input_1.getResource(param);
    this.resource = resourceService.resource();
    this.getLocale = input_1.getLocaleFunc(param, getLocale);
    this.loading = input_1.getLoadingFunc(param, loading);
    this.ui = input_1.getUIService(param, uis);
    this.showError = input_1.getErrorFunc(param, showError);
    this.showMessage = input_1.getMsgFunc(param, showMessage);
    this.confirm = input_1.getConfirmFunc(param, confirm);
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
    var _this = this;
    var id = _id;
    if (id && id !== '') {
      this.service.load(id).then(function (obj) {
        if (!obj) {
          _this.handleNotFound(_this.form);
        }
        else {
          _this.newMode = false;
          _this.orginalModel = reflect_1.clone(obj);
          _this.formatModel(obj);
          if (callback) {
            callback(obj, _this.showModel);
          }
          else {
            _this.showModel(obj);
          }
        }
        _this.running = false;
        core_1.hideLoading(_this.loading);
      }).catch(function (err) {
        var data = (err && err.response) ? err.response : err;
        if (data && data.status === 404) {
          _this.handleNotFound(_this.form);
        }
        else {
          core_1.error(err, _this.resource, _this.showError);
        }
        _this.running = false;
        core_1.hideLoading(_this.loading);
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
    if (this.running === true) {
      return;
    }
    var com = this;
    var obj = com.getModel();
    if (!newMod) {
      var diffObj_1 = reflect_1.makeDiff(this.orginalModel, obj, this.keys, this.version);
      var l = Object.keys(diffObj_1).length;
      if (l === 0) {
        this.showMessage(r['msg_no_change']);
      }
      else {
        com.validate(obj, function () {
          var msg = core_1.message(r, 'msg_confirm_save', 'confirm', 'yes', 'no');
          _this.confirm(msg.message, msg.title, function () {
            com.doSave(obj, diffObj_1, isBack);
          }, msg.no, msg.yes);
        });
      }
    }
    else {
      com.validate(obj, function () {
        var msg = core_1.message(r, 'msg_confirm_save', 'confirm', 'yes', 'no');
        _this.confirm(msg.message, msg.title, function () {
          com.doSave(obj, obj, isBack);
        }, msg.no, msg.yes);
      });
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
    var _this = this;
    this.running = true;
    if (this.loading) {
      this.loading.showLoading();
    }
    var isBackO = (isBack == null || isBack === undefined ? this.backOnSuccess : isBack);
    var com = this;
    if (!this.newMode) {
      if (this.service.patch && this.patchable === true && body && Object.keys(body).length > 0) {
        this.service.patch(body).then(function (result) { return com.postSave(result, obj, isBackO); }).catch(function (err) { return _this.handleError(err); });
      }
      else {
        this.service.update(obj).then(function (result) { return com.postSave(result, obj, isBackO); }).catch(function (err) { return _this.handleError(err); });
      }
    }
    else {
      reflect_1.trim(obj);
      this.service.insert(obj).then(function (result) { return com.postSave(result, obj, isBackO); }).catch(function (err) { return _this.handleError(err); });
    }
  };
  EditComponent.prototype.succeed = function (msg, origin, isBack, model) {
    if (model) {
      this.newMode = false;
      if (model && this.setBack) {
        this.resetState(false, model, reflect_1.clone(model));
      }
      else {
        edit_1.handleVersion(origin, this.version);
      }
    }
    else {
      edit_1.handleVersion(origin, this.version);
    }
    var isBackO = (isBack == null || isBack === undefined ? this.backOnSuccess : isBack);
    this.showMessage(msg);
    if (isBackO) {
      this.back();
    }
  };
  EditComponent.prototype.fail = function (result) {
    var f = this.form;
    var u = this.ui;
    if (u && f) {
      var unmappedErrors = u.showFormError(f, result);
      formutil_1.focusFirstError(f);
      if (unmappedErrors && unmappedErrors.length > 0) {
        var t = this.resource['error'];
        if (u && u.buildErrorMessage) {
          var msg = u.buildErrorMessage(unmappedErrors);
          this.showError(msg, t);
        }
        else {
          this.showError(unmappedErrors[0].field + ' ' + unmappedErrors[0].code + ' ' + unmappedErrors[0].message, t);
        }
      }
    }
    else {
      var t = this.resource['error'];
      if (result.length > 0) {
        this.showError(result[0].field + ' ' + result[0].code + ' ' + result[0].message, t);
      }
      else {
        this.showError(t, t);
      }
    }
  };
  EditComponent.prototype.postSave = function (res, origin, isPatch, backOnSave) {
    this.running = false;
    if (this.loading) {
      this.loading.hideLoading();
    }
    var newMod = this.newMode;
    var successMsg = (newMod ? this.insertSuccessMsg : this.updateSuccessMsg);
    var x = res;
    if (Array.isArray(x)) {
      this.fail(x);
    }
    else if (!isNaN(x)) {
      if (x >= 1) {
        this.succeed(successMsg, origin, backOnSave);
      }
      else {
        if (newMod && x <= 0) {
          this.handleDuplicateKey();
        }
        else if (!newMod && x === 0) {
          this.handleNotFound();
        }
        else {
          this.showError(this.resource['error_version'], this.resource['error']);
        }
      }
    }
    else {
      var result = x;
      if (isPatch) {
        var keys = Object.keys(result);
        var a = origin;
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
          var k = keys_1[_i];
          a[k] = result[k];
        }
        this.succeed(successMsg, a, backOnSave);
      }
      else {
        this.succeed(successMsg, origin, backOnSave, result);
      }
      this.showMessage(successMsg);
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
  function SearchComponent() {
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
    _this.initFields = false;
    _this.sequenceNo = 'sequenceNo';
    _this.triggerSearch = false;
    _this.pageMaxSize = 20;
    _this.pageSizes = [10, 20, 40, 60, 100, 200, 400, 1000];
    _this.filter = {};
    _this.list = [];
    _this.chkAll = null;
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
      com.nextPageToken = sr.next;
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
  function DiffApprComponent() {
    var _this = _super !== null && _super.apply(this, arguments) || this;
    _this.resource = {};
    return _this;
  }
  DiffApprComponent.prototype.onCreated = function (service, param, showMessage, showError, loading) {
    this.service = service;
    var resourceService = input_1.getResource(param);
    this.resource = resourceService.resource();
    this.loading = input_1.getLoadingFunc(param, loading);
    this.showError = input_1.getErrorFunc(param, showError);
    this.showMessage = input_1.getMsgFunc(param, showMessage);
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
      var com_2 = this;
      this.service.diff(_id).then(function (dobj) {
        if (!dobj) {
          com_2.handleNotFound(com_2.form);
        }
        else {
          var formatdDiff = diff_1.formatDiffModel(dobj, com_2.formatFields);
          com_2.value = formatdDiff.value;
          com_2.origin = formatdDiff.origin;
          if (com_2.form) {
            diff_1.showDiff(com_2.form, formatdDiff.value, formatdDiff.origin);
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
    var r = this.resource;
    if (this.id) {
      this.running = true;
      core_1.showLoading(this.loading);
      this.service.approve(this.id).then(function (status) {
        if (status > 0) {
          com.showMessage(r['msg_approve_success']);
        }
        else if (status < 0) {
          com.showMessage(r['msg_approve_version_error']);
        }
        else if (status === 0) {
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
    var r = this.resource;
    if (this.id) {
      this.running = true;
      core_1.showLoading(this.loading);
      this.service.reject(this.id).then(function (status) {
        if (status > 0) {
          com.showMessage(r['msg_reject_success']);
        }
        else if (status === 0) {
          com.showMessage(r['msg_approve_version_error']);
        }
        else if (status < 0) {
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
