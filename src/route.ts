import * as qs from 'query-string';
import VueRouter from 'vue-router';
import {Route} from 'vue-router';

export function navigate($router: VueRouter, stateTo: string, params = null) {
  const objParams = params != null ? '/'.concat((params as any).join('/')) : '';
  $router.push({path: stateTo.concat(objParams)});
}

export function buildFromUrl(): any {
  return buildParameters(window.location.search);
}

export function buildParameters(url: string): any {
  let urlSearch = url;
  const i = urlSearch.indexOf('?');
  if (i >= 0) {
    urlSearch = url.substr(i + 1);
  }
  const parsed = qs.parse(urlSearch);
  return parsed;
}

export function buildId(primaryKeys: string[], route0: Route): any {
  if (!route0) {
    return null;
  }
  const route: any =  route0;
  const param: any = route ? route.params : {}; // const param: any = route.history.current.params; // const param: any = route?.params || {};
  if (!(primaryKeys && primaryKeys.length > 0)) {
    return null;
  } else {
    if (primaryKeys.length === 1) {
      const x = param[primaryKeys[0]];
      if (x && x !== '') {
        return x;
      }
      return param['id'];
    } else {
      const id: any = {};
      for (const key of primaryKeys) {
        const v = param[key];
        if (!v) {
          return null;
        }
        id[key] = v;
      }
      return id;
    }
  }
}
