# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-11-06

### Added
- Initial release of HAR Viewer
- Multiple visualization modes with three distinct views:
  - Table View: Sortable, filterable tabular display with inline request details
  - Waterfall Chart: Timeline-based visualization with color-coded timing phases
  - Statistics Dashboard: Comprehensive performance metrics and request breakdowns
- Advanced filtering system:
  - Built-in filters (All Requests, 4xx Errors, 5xx Errors, Other Errors)
  - Custom filter creation with path-based and regex-based matching
  - Persistent filter storage across sessions
  - Real-time filter counts showing matched requests
- Request Inspector with multi-tab interface:
  - General tab: Request/response overview with timing information
  - Headers tab: Request and response headers with search functionality
  - Cookies tab: Request and response cookies details
  - Payload tab: Request payload with JSON viewer and search
  - Response tab: Response content with JSON viewer and search
  - Timings tab: Visual breakdown of request timing phases
- JSON Viewer enhancements:
  - Copy-to-clipboard buttons for all JSON values
  - Chrome DevTools-style collapsed previews showing first key/value or array item
  - Interactive breadcrumb navigation showing path to selected values
  - Inline search with match highlighting and navigation
  - Click any value to see its path in breadcrumbs
  - Blinking cursor indicator on selected values
- Headers search functionality:
  - Search across both request and response headers
  - Search in both header names and values
  - Real-time highlighting of matching text
  - Display of filtered header counts
- Performance Dashboard metrics:
  - Total requests count and unique domains
  - Total data transfer size with compression metrics
  - Average response time calculation
  - Request breakdown by resource type (Documents, Stylesheets, Scripts, XHR/Fetch, Images, Fonts, Media, WebSockets, Other)
  - Detailed timing breakdown visualization
- Theme support:
  - Light and dark modes with system integration
  - Persistent theme preference across sessions
  - Smooth transitions between themes
- File upload capabilities:
  - Drag-and-drop support for HAR files
  - File validation (.har, .json extensions)
  - Size limit enforcement (50MB)
  - Clear error messaging for invalid files
- Real-time search functionality:
  - Search across all request endpoints and URLs
  - Integration with filter system
  - Case-insensitive matching
- Close button in Request Inspector for returning to full list view
- Automatic search reset when switching between API calls
- Dynamic breadcrumb behavior:
  - Shows search match path when navigating results
  - Shows clicked value path when interacting with JSON
  - Automatically switches based on most recent action

### Changed
- Reordered view tabs: Table (default), Waterfall, Statistics for better workflow
- JSON search bar moved inline with section headers for improved UX
- Statistics dashboard shows all metrics by default (removed collapsible behavior)
- Responsive layout improvements:
  - Added horizontal scroll support for table and waterfall views
  - Adjusted grid columns with minmax for flexible sizing
  - Set appropriate min-widths (600px waterfall, 650px table)
- Split-panel layout: 25% list panel, 75% details panel for optimal space usage

### Fixed
- Responsive layout issues when request details panel is displayed
- ESLint errors throughout the codebase
- Minor UI inconsistencies and visual hierarchy issues

### Technical Details
- Built with React 19.1.1 and TypeScript 5.9.3
- Vite 7.1.7 for fast build tooling
- Styled Components 6.1.19 for component styling
- Zustand 5.0.8 for global state management
- Lucide React for consistent iconography
- Full HAR 1.2 specification support
- Zero backend required (fully client-side)
- Hybrid state management (React Context API + Zustand)

[Unreleased]: https://github.com/yourusername/har-viewer/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/yourusername/har-viewer/releases/tag/v0.1.0
