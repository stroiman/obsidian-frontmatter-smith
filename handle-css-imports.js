/* eslint-disable */

console.log("SETUP NEW REQUIRE");

const originalRequire = require;

require = function (...args) {
  console.log("***** REQUIRE ******", ...args);
  return originalRequire(...args);
};
