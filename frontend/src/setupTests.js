// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom

import "@testing-library/jest-dom";

const { webcrypto } = require("crypto");
const { TextEncoder, TextDecoder } = require("util");

// Polyfill Web Crypto
Object.defineProperty(globalThis, "crypto", {
  value: webcrypto,
});

// Polyfill TextEncoder/TextDecoder
Object.defineProperty(globalThis, "TextEncoder", {
  value: TextEncoder,
});

Object.defineProperty(globalThis, "TextDecoder", {
  value: TextDecoder,
});