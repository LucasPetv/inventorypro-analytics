# Changelog

All notable changes to InventoryPro Analytics will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-03-12

### Added
- Excel/CSV import functionality with flexible column mapping
- KPI Dashboard with inventory calculations
- Portable Electron distribution support
- Secure demo mode for standalone operation
- Modern React + TypeScript + Tailwind UI
- Comprehensive test data files
- Column mapping configuration in settings
- Logo and branding support

### Fixed
- Fixed `TypeError: Cannot convert undefined or null to object` in DataInput component
- Fixed white screen issue in Electron production builds
- Fixed logo loading in production builds through proper ES module imports
- Made column mapping handling more defensive against null/undefined values
- Fixed prop interface mismatches between components

### Technical Improvements
- Added TypeScript declarations for image imports
- Improved error handling in file processing
- Enhanced dev/production mode detection in Electron
- Added comprehensive .gitignore and project documentation
- Optimized Vite build configuration
- Added proper TypeScript type safety throughout

### Security
- Implemented secure standalone mode with no external connections
- Added portable app security measures
- Removed backend dependencies for demo distribution

## [1.0.0] - 2026-03-11

### Added
- Initial release
- Basic inventory analysis functionality
- React + Electron architecture
- TypeScript support
