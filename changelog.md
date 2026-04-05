# Changelog

All notable changes to the `@asyncpay/checkout` SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.0.38] - 2024-06-16 (Unreleased / In Progress)

### Added
- **`extendSubscriptionBy` option** — New checkout parameter that accepts a `string | number` value representing the number of billing periods to add to a customer's existing subscription. When provided, the checkout charges the customer `plan price × extendSubscriptionBy` in a single payment and extends their subscription accordingly. The value is normalised to an integer before being sent to the API (`extend_subscription_by`).
- **ESM build output** — The rollup build now produces a dedicated ES Module bundle at `dist/bundle.esm.js` in addition to the existing CJS and UMD outputs. The `module` field in `package.json` now points to this ESM bundle, enabling better tree-shaking for bundler users.

### Changed
- `package.json` `module` entry updated from `dist/bundle.js` to `dist/bundle.esm.js` to correctly target the new ESM output.
- `rollup.config.mjs` updated to include the `esm` format output alongside the existing `cjs` and `umd` outputs.
- README options table updated with `extendSubscriptionBy` entry and description.

---

## [0.0.37] - 2024-06-16

### Added
- **`metadata` option** — Accepts an object of string key/value pairs to attach arbitrary metadata to a checkout payment request.
- **`savePaymentMethod` option** — Boolean flag that instructs Asyncpay to save the payment method used during checkout, enabling future off-session charges for that customer.

---

## [0.0.36] - 2024-05-14

### Fixed
- Wrapped `JSON.parse` of incoming `postMessage` event data in a `try/catch` to silently discard non-Asyncpay events instead of crashing.

### Changed
- Updated npm dependencies.

---

## [0.0.35] - 2024-05-07

### Added
- **UMD build output** — Added a `dist/bundle.umd.js` UMD bundle suitable for direct `<script>` tag usage in browsers. The `browser` field in `package.json` now points to this bundle.
- Test HTML page (`example/test.html`) for quickly verifying the SDK in a browser environment.

### Changed
- Amount regex updated to allow flexible decimal places up to a maximum of three (e.g. `10`, `10.5`, `10.50`, `10.500` are all valid).

---

## [0.0.34] - 2023-10-07

### Fixed
- Prevented `onError` callback from being invoked more than once per checkout session by introducing an internal guard flag.

### Added
- Error callback (`onError`) now receives a structured `Error` object with `error`, `error_code`, and `error_description` fields.
- Improved error logging throughout the SDK internals.

---

## [0.0.33] - 2023-10-03

### Added
- Subscription support via `subscriptionPlanUUID` and `subscriptionPlanLink` options. When either is provided, `amount`, `currency`, and `description` are ignored and the checkout routes to the subscription flow.

---

## [0.0.32] - 2023-08-14

### Changed
- Default checkout environment changed from `dev` to `prod` now that the platform is out of internal beta.

---

## [0.0.31] - 2023-06-01

### Refactored
- Extracted checkout iframe teardown logic into a dedicated `unsetCheckoutSession` helper function for cleaner error and close handling.
- Rewrote post-checkout cleanup flow to ensure the iframe and session state are always removed correctly, even in error paths.

### Fixed
- SDK no longer leaves orphaned iframe elements in the DOM when an error occurs during initialisation.

---

## [0.0.30] - 2023-05-31

### Fixed
- Added race condition guard: if a checkout session is already in progress (detected via `sessionStorage` key or existing wrapper element), subsequent calls are rejected with an `SDK_ERROR_CHECKOUT_IN_SESSION` error rather than spawning a second iframe.

---

## [0.0.29] - 2023-05-05

### Changed
- Converted the library from plain JavaScript to **TypeScript**.
- Updated rollup compiler options to produce correct TypeScript declarations.
- Added `types/index.d.ts` declaration file for full type safety when using the SDK in TypeScript projects.

---

## [0.0.28] - 2023-05-04

### Added
- `onClose` callback — fires whenever the checkout modal closes, regardless of the reason (success, cancel, or error).
- `reference` option — allows merchants to supply their own idempotency reference to be tied to the payment request.

---

## [0.0.27] - 2023-05-03

### Added
- Repository field added to `package.json` pointing to the GitHub source.

---

## [0.0.1] - 2023-05-01

### Added
- Initial release of `@asyncpay/checkout`.
- Core `AsyncpayCheckout` function with iframe-based checkout flow.
- Support for `publicKey`, `amount`, `currency`, `description`, `customerEmail`, `customerUUID`, `customer`, `paymentChannel`, `successURL`, `cancelURL`, `onCancel`, `onSuccess`, `logo` options.
- Rollup-based build with minification.
- Published to npm as `@asyncpay/checkout`.
