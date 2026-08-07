# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [0.2.0](https://github.com/engineervix/zynlepay-node/compare/v0.1.0...v0.2.0) (2026-08-07)

### ⚠ BREAKING CHANGES

* **callback:** ZynlePayCallback.status now "success" | "failed"
  (derived), not raw string. New required field responseCode.

### 🐛 Bug Fixes

* **callback:** read response_code instead of a status field ZynlePay never sends ([0bfdfce](https://github.com/engineervix/zynlepay-node/commit/0bfdfceea0d0ab88a39fef21ec2dba647b35ee1d))
* **docs:** inline feature icons so they adapt to dark mode ([d65d9f5](https://github.com/engineervix/zynlepay-node/commit/d65d9f51b1f6e4ad4a00c638268b023cc44243a1))

### 📝 Docs

* **callbacks:** show the real callback payload and the duplicate-callback gotcha ([f08b81e](https://github.com/engineervix/zynlepay-node/commit/f08b81e26f2103cca7615da139bb49f2e271c82e))
* **momo-deposit:** document confirmed response_code values from live sandbox testing ([44a4d88](https://github.com/engineervix/zynlepay-node/commit/44a4d880bce9c17a374110cf2e64dc9b5228b90b))
* **payment-status:** point consumers at response_code, not the unobserved status field ([df2bd13](https://github.com/engineervix/zynlepay-node/commit/df2bd139f41b9d17349c807fe528c2a368fe531f))
* **readme:** sync examples with the response_code and callback field fixes ([942d16a](https://github.com/engineervix/zynlepay-node/commit/942d16a9a5f831c94b9358aaa707a7b503c665e9))
## 0.1.0 (2026-08-07)

### 🚀 Features

* this is an unofficial ZynlePay Node.js client ([d243a48](https://github.com/engineervix/zynlepay-node/commit/d243a4829ab2d0a4cc772efc6569350a29f1d9d8))

### 🐛 Bug Fixes

* **ci:** build before typecheck so scripts/smoke.ts resolves dist ([8ba17a2](https://github.com/engineervix/zynlepay-node/commit/8ba17a2c3d6b45ea7c68db4d5774cb53cfdaa9e4))
