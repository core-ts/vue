"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function trim(obj) {
  if (!obj || typeof obj !== 'object' || obj instanceof Date) {
    return;
  }
  var keys = Object.keys(obj);
  for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
    var key = keys_1[_i];
    var v = obj[key];
    if (v == null || v === '' || v === undefined) {
      delete obj[key];
    }
    else if (typeof v === 'object') {
      if (!Array.isArray(v)) {
        trim(v);
      }
      else {
        if (v.length === 0) {
          delete obj[key];
        }
        else {
          for (var _a = 0, v_1 = v; _a < v_1.length; _a++) {
            var item = v_1[_a];
            trim(item);
          }
        }
      }
    }
  }
  return obj;
}
exports.trim = trim;
function clone(obj) {
  if (!obj) {
    return obj;
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  if (typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    var arr = [];
    for (var _i = 0, obj_1 = obj; _i < obj_1.length; _i++) {
      var sub = obj_1[_i];
      var c = clone(sub);
      arr.push(c);
    }
    return arr;
  }
  var x = {};
  var keys = Object.keys(obj);
  for (var _a = 0, keys_2 = keys; _a < keys_2.length; _a++) {
    var k = keys_2[_a];
    var v = obj[k];
    if (v instanceof Date) {
      x[k] = new Date(v.getTime());
    }
    else {
      switch (typeof v) {
        case 'object':
          x[k] = clone(v);
          break;
        default:
          x[k] = v;
          break;
      }
    }
  }
  return x;
}
exports.clone = clone;
function getDirectValue(obj, key) {
  if (obj && obj.hasOwnProperty(key)) {
    return obj[key];
  }
  return null;
}
exports.getDirectValue = getDirectValue;
function setValue(obj, key, value) {
  var replaceKey = key.replace(/\[/g, '.[').replace(/\.\./g, '.');
  if (replaceKey.indexOf('.') === 0) {
    replaceKey = replaceKey.slice(1, replaceKey.length);
  }
  var keys = replaceKey.split('.');
  var firstKey = keys.shift();
  if (!firstKey) {
    return;
  }
  var isArrayKey = /\[([0-9]+)\]/.test(firstKey);
  if (keys.length > 0) {
    var firstKeyValue = obj[firstKey] || {};
    var returnValue = setValue(firstKeyValue, keys.join('.'), value);
    return setKey(obj, isArrayKey, firstKey, returnValue);
  }
  return setKey(obj, isArrayKey, firstKey, value);
}
exports.setValue = setValue;
var setKey = function (_object, _isArrayKey, _key, _nextValue) {
  if (_isArrayKey) {
    if (_object.length > _key) {
      _object[_key] = _nextValue;
    }
    else {
      _object.push(_nextValue);
    }
  }
  else {
    _object[_key] = _nextValue;
  }
  return _object;
};
function diff(obj1, obj2) {
  var fields = [];
  var key1s = Object.keys(obj1);
  for (var _i = 0, key1s_1 = key1s; _i < key1s_1.length; _i++) {
    var k = key1s_1[_i];
    var v1 = obj1[k];
    var v2 = obj2[k];
    if (v1 == null) {
      if (v2 != null) {
        fields.push(k);
      }
    }
    else {
      if (typeof v1 !== 'object') {
        if (v1 !== v2) {
          fields.push(k);
        }
      }
      else {
        var e = equal(v1, v2);
        if (!e) {
          fields.push(k);
        }
      }
    }
  }
  var key2s = Object.keys(obj2);
  var ni = notIn(key1s, key2s);
  for (var _a = 0, ni_1 = ni; _a < ni_1.length; _a++) {
    var n = ni_1[_a];
    fields.push(n);
  }
  return fields;
}
exports.diff = diff;
function makeDiff(o1, o2, keys, version) {
  var obj1 = o1;
  var obj2 = o2;
  var obj3 = {};
  var s = diff(obj1, obj2);
  if (s.length === 0) {
    return obj3;
  }
  for (var _i = 0, s_1 = s; _i < s_1.length; _i++) {
    var d = s_1[_i];
    obj3[d] = obj2[d];
  }
  if (keys && keys.length > 0) {
    for (var _a = 0, keys_3 = keys; _a < keys_3.length; _a++) {
      var x = keys_3[_a];
      if (x.length > 0) {
        obj3[x] = obj1[x];
      }
    }
  }
  if (version && version.length > 0) {
    obj3[version] = obj1[version];
  }
  return obj3;
}
exports.makeDiff = makeDiff;
function notIn(s1, s2) {
  var r = [];
  for (var _i = 0, s2_1 = s2; _i < s2_1.length; _i++) {
    var s = s2_1[_i];
    if (s1.indexOf(s) < 0) {
      r.push(s);
    }
  }
  return r;
}
exports.notIn = notIn;
function equal(obj1, obj2) {
  if (obj1 == null && obj2 == null) {
    return true;
  }
  if (obj1 == null || obj2 == null) {
    return false;
  }
  if ((typeof obj1) !== (typeof obj2)) {
    return false;
  }
  if (typeof obj1 !== 'object') {
    return obj1 === obj2;
  }
  if (obj1 instanceof Date) {
    if (!(obj2 instanceof Date)) {
      return false;
    }
    return (obj1.getTime() === obj2.getTime());
  }
  if ((Array.isArray(obj1) && !Array.isArray(obj2))
    || (!Array.isArray(obj1) && Array.isArray(obj2))) {
    return false;
  }
  if (!Array.isArray(obj1) && !Array.isArray(obj2)) {
    var key1s = Object.keys(obj1);
    var key2s = Object.keys(obj2);
    if (key1s.length !== key2s.length) {
      return false;
    }
    for (var _i = 0, key1s_2 = key1s; _i < key1s_2.length; _i++) {
      var k = key1s_2[_i];
      var v = obj1[k];
      if (typeof v !== 'object') {
        if (v !== obj2[k]) {
          return false;
        }
      }
      else {
        var e = equal(v, obj2[k]);
        if (e === false) {
          return false;
        }
      }
    }
    return true;
  }
  return equalArrays(obj1, obj2);
}
exports.equal = equal;
function equalArrays(ar1, ar2) {
  if (ar1 == null && ar2 == null) {
    return true;
  }
  if (ar1 == null || ar2 == null) {
    return false;
  }
  if (ar1.length !== ar2.length) {
    return false;
  }
  for (var i = 0; i < ar1.length; i++) {
    var e = equal(ar1[i], ar2[i]);
    if (e === false) {
      return false;
    }
  }
  return true;
}
exports.equalArrays = equalArrays;
function setAll(list, name, v) {
  if (list) {
    for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
      var obj = list_1[_i];
      obj[name] = v;
    }
  }
}
exports.setAll = setAll;
function equalAll(list, name, v) {
  if (list) {
    for (var _i = 0, list_2 = list; _i < list_2.length; _i++) {
      var obj = list_2[_i];
      if (obj[name] !== v) {
        return false;
      }
    }
  }
  return true;
}
exports.equalAll = equalAll;
