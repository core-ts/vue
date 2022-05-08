import * as qs from 'query-string';
import {RouteLocationNormalized, Router} from 'vue-router';

export function navigate($router: Router, stateTo: string, params?: any) {
  const objParams = params ? '/'.concat(params.join('/')) : '';
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

export function buildId<T>(route: RouteLocationNormalized, primaryKeys?: string[]): T|null {
  if (!route) {
    return null;
  }
  const r: any =  route;
  const param: any = r ? r.params : {}; // const param: any = route.history.current.params; // const param: any = route?.params || {};
  if (!(primaryKeys && primaryKeys.length > 0)) {
    return param['id'] as any;
  } else {
    if (primaryKeys.length === 1) {
      const x = param[primaryKeys[0]];
      if (x && x !== '') {
        return x;
      }
      return param['id'] as any;
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
