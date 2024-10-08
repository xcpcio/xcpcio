/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
// Generated by unplugin-vue-router. ‼️ DO NOT MODIFY THIS FILE ‼️
// It's recommended to commit this file.
// Make sure to add this file to your tsconfig.json file as an "includes" or "files" entry.

declare module 'vue-router/auto-routes' {
  import type {
    RouteRecordInfo,
    ParamValue,
    ParamValueOneOrMore,
    ParamValueZeroOrMore,
    ParamValueZeroOrOne,
  } from 'vue-router'

  /**
   * Route name map generated by unplugin-vue-router
   */
  export interface RouteNamedMap {
    '/': RouteRecordInfo<'/', '/', Record<never, never>, Record<never, never>>,
    '/[...all]': RouteRecordInfo<'/[...all]', '/:all(.*)', { all: ParamValue<true> }, { all: ParamValue<false> }>,
    '/about': RouteRecordInfo<'/about', '/about', Record<never, never>, Record<never, never>>,
    '/balloon/': RouteRecordInfo<'/balloon/', '/balloon', Record<never, never>, Record<never, never>>,
    '/board': RouteRecordInfo<'/board', '/board', Record<never, never>, Record<never, never>>,
    '/countdown/': RouteRecordInfo<'/countdown/', '/countdown', Record<never, never>, Record<never, never>>,
    '/hi/[name]': RouteRecordInfo<'/hi/[name]', '/hi/:name', { name: ParamValue<true> }, { name: ParamValue<false> }>,
    '/rating/': RouteRecordInfo<'/rating/', '/rating', Record<never, never>, Record<never, never>>,
    '/rating/[...all]': RouteRecordInfo<'/rating/[...all]', '/rating/:all(.*)', { all: ParamValue<true> }, { all: ParamValue<false> }>,
    '/resolver/': RouteRecordInfo<'/resolver/', '/resolver', Record<never, never>, Record<never, never>>,
    '/test': RouteRecordInfo<'/test', '/test', Record<never, never>, Record<never, never>>,
  }
}
