"use strict";
function __export(m) {
  for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./core"));
__export(require("./edit"));
__export(require("./route"));
__export(require("./components"));
__export(require("./diff"));
__export(require("./formutil"));
__export(require("./reflect"));
__export(require("./search"));
__export(require("./reflect"));
__export(require("./search"));
function getParam(url, i) {
  var ps = url.split('/');
  if (!i || i < 0) {
    i = 0;
  }
  return ps[ps.length - 1 - i];
}
exports.getParam = getParam;
