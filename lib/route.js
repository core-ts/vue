"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var qs = require("query-string");
function navigate($router, stateTo, params) {
  if (params === void 0) { params = null; }
  var objParams = params != null ? '/'.concat(params.join('/')) : '';
  $router.push({ path: stateTo.concat(objParams) });
}
exports.navigate = navigate;
function buildFromUrl() {
  return buildParameters(window.location.search);
}
exports.buildFromUrl = buildFromUrl;
function buildParameters(url) {
  var urlSearch = url;
  var i = urlSearch.indexOf('?');
  if (i >= 0) {
    urlSearch = url.substr(i + 1);
  }
  var parsed = qs.parse(urlSearch);
  return parsed;
}
exports.buildParameters = buildParameters;
function buildId(route, primaryKeys) {
  if (!route) {
    return null;
  }
  var r = route;
  var param = r ? r.params : {};
  if (!(primaryKeys && primaryKeys.length > 0)) {
    return null;
  }
  else {
    if (primaryKeys.length === 1) {
      var x = param[primaryKeys[0]];
      if (x && x !== '') {
        return x;
      }
      return param['id'];
    }
    else {
      var id = {};
      for (var _i = 0, primaryKeys_1 = primaryKeys; _i < primaryKeys_1.length; _i++) {
        var key = primaryKeys_1[_i];
        var v = param[key];
        if (!v) {
          return null;
        }
        id[key] = v;
      }
      return id;
    }
  }
}
exports.buildId = buildId;
