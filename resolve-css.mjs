/*
 * Helper to support unit testing UI behaviour!
 *
 * This is not included in the build; it is only loaded when running test
 * code.
 *
 * This module setups up a custom loader for loading CSS modules, and
 * returning an object with CSS class names converted to camelCase.
 *
 * This allows modules depending on CSS modules to be loaded in a node.js
 * environment.
 *
 * This duplicates the behaviour of both ESBuild and Vite.js.
 *
 * The goal it to have the fastest possible feedback during testing; so while
 * a solution that avoids duplication is desireable; it mus tnot be at the
 * expense of speed.
 */
import { Module } from "node:module";
import * as path from "node:path";
import * as fs from "node:fs";

const originalRequire = Module.prototype.require;
const classNamesRegExp = /\.([a-zA-Z0-9-_]+)/g;
const toCamelCaseRegExp = /-+(\w)/g;

Module.prototype.require = function () {
  const imported = arguments[0];
  if (path.extname(imported) !== ".css") {
    return originalRequire.apply(this, arguments);
  }
  const fileName = path.join(this.path, imported);
  const cssContents = fs.readFileSync(fileName, {
    encoding: "utf-8",
    flag: "r",
  });

  const matches = cssContents.matchAll(classNamesRegExp);

  const result = {};
  for (const match of matches) {
    const className = match[1];
    const newClassName = className.replace(toCamelCaseRegExp, (x, y) =>
      y.toUpperCase(),
    );
    result[newClassName] = className;
  }
  return result;
};
