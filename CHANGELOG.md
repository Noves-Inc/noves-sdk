# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.6] - 2025-05-08

### Added
- New Cosmos Translate API implementation:
    - Comprehensive test coverage for Cosmos Translate functionality
    - Detailed documentation for Cosmos Translate API
    - Example implementations for Cosmos Translate API usage
    - New utility functions for Cosmos address validation
    - New error types for Cosmos-specific operations

### Changed
- Improved overall documentation structure
- Enhanced error handling across the SDK


## [1.0.5] - 2025-05-08

### Changed
- Updated token balance tests to be more resilient to API response changes
- Made `usdValue` field validation optional in token balance responses
- Improved test coverage for EVM, SVM, TVM, and UTXO translate modules

### Added
- New `getTxTypes` method to retrieve available transaction types from the EVM Translate API


## [1.0.4] - 2025-04-18

### Fixed
- Fixed `getTokenBalances` method to handle different response formats correctly
- Updated tests to match actual API behavior
- Updated documentation to accurately reflect current implementation