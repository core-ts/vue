export * from './core';
export * from './edit';
export * from './route';
export * from './components';
export * from './diff';
export * from './formutil';
export * from './reflect';
export * from './search';
export * from './reflect';
export * from './search';

export function getParam(url: string, i?: number): string {
  const ps = url.split('/');
  if (!i || i < 0) {
    i = 0;
  }
  return ps[ps.length - 1 - i];
}
