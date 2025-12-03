# HAR Viewer

> A modern, interactive web application for analyzing and visualizing HTTP Archive (HAR) files

[![React](https://img.shields.io/badge/React-19.1.1-61dafb?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.7-646cff?logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## 🎯 About

### What is HAR?

HTTP Archive (HAR) is a JSON-formatted archive file format for logging web browser interactions with websites. HAR files contain detailed performance data about web page loads, including timing information, request/response headers, and resource details.

### What does this viewer do?

HAR Viewer is a powerful, client-side tool for analyzing HAR files with:

- **Zero backend required** - All processing happens in your browser
- **Rich visualizations** - Waterfall charts and tabular views
- **Advanced filtering** - Built-in and custom filter support
- **Interactive navigation** - JSON breadcrumb navigation with click-to-explore
- **Performance insights** - Comprehensive timing breakdowns and metrics
- **Cursor IDE Integration** - Send API calls directly to Cursor for AI-powered analysis via MCP
- **Modern UX** - Dark/light themes, drag-and-drop uploads, responsive design

## ✨ Features

### 🎨 Multiple Visualization Modes

- **Table View**: Sortable, filterable tabular display of all network requests with inline details
- **Waterfall Chart**: Timeline-based visualization with color-coded timing phases (DNS, Connect, SSL, Send, Wait, Receive)
- **Statistics Dashboard**: Comprehensive performance metrics and request breakdowns

### 🔍 Advanced Filtering System

- **Built-in Filters**:
  - All Requests
  - 4xx Client Errors
  - 5xx Server Errors
  - Other Errors

- **Custom Filters**:
  - Path-based matching (substring search)
  - Regex-based matching (advanced patterns)
  - Persistent storage with local save
  - Real-time filter counts

### 🗺️ JSON Breadcrumb Navigation

- Click any value in JSON request/response to see its path
- Interactive breadcrumb showing: `root > response > data > user > name`
- Navigate up the JSON tree by clicking breadcrumb segments
- Blinking cursor indicator for selected values
- Works with both search results and manual selection

### 🔎 Request Inspector

Multi-tab interface for detailed request analysis:
- **General**: URL, method, status, size, timing summary
- **Headers**: Request and response headers
- **Cookies**: Request and response cookies
- **Payload**: POST data with JSON viewer and inline search
- **Response**: Response body with JSON viewer and inline search
- **Timings**: Detailed timing breakdown with visual bars

The inspector appears as a split panel when you select a request, with the list on the left (25%) and details on the right (75%). Both views support horizontal scrolling for responsive layouts.

### 🤖 Cursor IDE Integration

Seamlessly integrate with Cursor IDE for AI-powered API analysis:

- **Settings System**: Enable/disable integration via settings modal
- **Real-time Status Monitoring**: Visual connection status badge with 4 states:
  - 🟢 **Connected**: MCP server is reachable
  - 🔴 **Disconnected**: Server not reachable
  - ⚪ **Disabled**: Integration turned off
  - 🟡 **Checking**: Verifying connection status
- **One-Click Send**: "Send to Cursor" button appears in Request Inspector when enabled
- **Visual Feedback**: Success/error states with auto-reset (3 seconds)
- **Automatic Health Checks**: Monitors MCP server connectivity every 10 seconds
- **Persistent Settings**: Integration preferences saved across browser sessions
- **Setup Guide**: Built-in step-by-step visual instructions
- **Connection Testing**: Manual test connection with loading animation
- **MCP Server URL**: Display and copy server URL (http://localhost:3100/mcp)

### 📊 Performance Dashboard

- Total requests and domain count
- Total size (with compression metrics)
- Average response time
- Requests breakdown by type (HTML, CSS, JS, images, etc.)
- Timing breakdown (DNS, Connect, SSL, Wait, Receive)

### 🎨 Theme Support

- Light and dark modes
- Persistent theme preference
- System-integrated with HTML data attributes
- Comprehensive color system for status codes and resource types

### 📁 File Upload

- Drag-and-drop support
- File validation (.har, .json)
- Size limit (50MB)
- Clear error messaging

### 🔍 Real-time Search

- Search across endpoints and URLs
- Integrates seamlessly with filter system
- Highlights matches in breadcrumb navigation

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.1 | UI framework |
| **TypeScript** | 5.9.3 | Type safety |
| **Vite** | 7.1.7 | Build tool & dev server |
| **Styled Components** | 6.1.19 | CSS-in-JS styling |
| **Zustand** | 5.0.8 | State management (with persist middleware) |
| **Lucide React** | - | Icon library |

### Development

| Tool | Version | Purpose |
|------|---------|---------|
| **ESLint** | 9.36.0 | Code linting |
| **TypeScript ESLint** | 8.45.0 | TypeScript-specific linting |
| **React Hooks ESLint** | 5.2.0 | React best practices |

## 🏗️ Architecture

### State Management Strategy

HAR Viewer uses a **hybrid state management approach**:

```
┌─────────────────────────────────────────┐
│           Application State             │
├─────────────────────────────────────────┤
│                                         │
│  Context API (React Context)           │
│  ├── HARContext                        │
│  │   └── HAR data processing           │
│  └── ThemeContext                      │
│      └── Theme provider wrapper        │
│                                         │
│  Zustand Stores (with persistence)     │
│  ├── useThemeStore                     │
│  │   └── Theme persistence             │
│  ├── useCustomFiltersStore            │
│  │   └── Filter definitions            │
│  └── useSettingsStore                 │
│      └── Cursor integration settings   │
│                                         │
│  Services                               │
│  └── mcpClient                         │
│      └── MCP server communication      │
│                                         │
└─────────────────────────────────────────┘
```

**Why this hybrid approach?**

- **Context API**: Best for frequently changing, cross-component data (HAR entries, selections)
- **Zustand**: Ideal for persistent user preferences (theme, custom filters)
- **localStorage Integration**: Automatic persistence with Zustand middleware

### Component Architecture

```
App (Root)
├── ThemeProvider (styled-components)
├── HARProvider (Context)
└── Layout
    ├── Header
    │   ├── Title
    │   ├── FileInfo
    │   ├── ViewToggle
    │   ├── SettingsButton (with status badge & tooltip)
    │   │   └── SettingsModal
    │   │       ├── SetupIllustration (3-step guide)
    │   │       ├── Toggle Switch (enable/disable)
    │   │       ├── Connection Status Display
    │   │       ├── Test Connection Button
    │   │       └── Collapsible Requirements
    │   └── ThemeToggle
    │
    ├── Sidebar
    │   ├── SearchInput
    │   ├── FilterList
    │   │   ├── Built-in Filters
    │   │   └── Custom Filters
    │   └── FilterManageModal
    │
    └── Main Content
        └── View (conditional)
            ├── TableView
            │   ├── Table (with horizontal scroll)
            │   └── RequestInspector (split panel)
            │       ├── Tabs (General, Headers, Cookies, Payload, Response, Timings)
            │       ├── SendButton (conditional, when Cursor enabled)
            │       ├── CloseButton
            │       ├── JsonViewer (with inline search)
            │       └── JsonBreadcrumb
            │
            ├── WaterfallChart
            │   ├── WaterfallRow (×N)
            │   │   └── RequestInspector (split panel)
            │   └── Legend
            │
            └── SummaryDashboard
                ├── Total requests & domains
                ├── Size metrics (compressed/uncompressed)
                ├── Timing breakdown
                └── Request type breakdown
```

### Data Flow

```
1. File Upload
   └─> parseHARFile()
       └─> Validation
           └─> setHAR() in HARContext
               └─> Process entries (add metadata)
                   └─> State update
                       └─> UI re-render

2. Filter Selection
   └─> onFilterChange()
       └─> applyFilters(entries, activeFilter, customFilters)
           └─> Filtered entries
               └─> Update counts
                   └─> Re-render views

3. Custom Filter CRUD
   └─> useCustomFiltersStore actions
       └─> Update Zustand state
           └─> Persist to localStorage
               └─> UI update
```

### Styling Architecture

**Styled Components with Theme System**

```typescript
// Theme object structure
{
  colors: {
    primary, background, text, border,
    status2xx, status3xx, status4xx, status5xx,
    success, error, warning, info, ...
  },
  spacing: { xs, sm, md, lg, xl, xxl },
  typography: { fontSize, fontWeight, fontFamily, fontFamilyMono },
  borderRadius: { sm, md, lg },
  shadows: { sm, md, lg },
  transitions: { fast, normal, slow }
}
```

**Benefits:**
- Component-scoped styles (no CSS conflicts)
- Dynamic theming with full TypeScript support
- Transient props (`$prop`) to avoid DOM attribute warnings
- Theme-aware styling with intellisense

### Type Safety

**Comprehensive TypeScript Coverage:**

- Full HAR 1.2 specification types
- Strict mode enabled (`noImplicitAny`, `strictNullChecks`)
- Custom types for enhanced entries (`EntryWithMetadata`)
- Discriminated unions for filter types
- Generic interfaces for reusable patterns

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18.0 or higher
- **Package Manager**: npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/har-viewer.git

# Navigate to project directory
cd har-viewer

# Install dependencies
npm install
# or
pnpm install
```

### Development

Start the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
# Type-check and build
npm run build

# Preview production build
npm run preview
```

### Linting

```bash
npm run lint
```

## 📁 Project Structure

```
har-viewer/
├── src/
│   ├── components/              # React UI components
│   │   ├── FileUpload.tsx      # Drag-drop file upload
│   │   ├── WaterfallChart.tsx  # Waterfall visualization
│   │   ├── WaterfallRow.tsx    # Individual request row
│   │   ├── TableView.tsx       # Table visualization
│   │   ├── Sidebar.tsx         # Filter sidebar
│   │   ├── FilterManageModal.tsx  # Filter editor
│   │   ├── RequestInspector.tsx   # Request details
│   │   ├── JsonViewer.tsx      # JSON display with search
│   │   ├── JsonBreadcrumb.tsx  # Path navigation
│   │   ├── SummaryDashboard.tsx   # Metrics dashboard
│   │   ├── ThemeToggle.tsx     # Theme switcher
│   │   ├── SettingsButton.tsx  # Settings button with status badge
│   │   ├── SettingsModal.tsx   # Cursor integration settings dialog
│   │   ├── SetupIllustration.tsx  # Visual setup guide
│   │   ├── shared/
│   │   │   └── Tooltip.tsx     # Reusable tooltip component
│   │   └── App.tsx             # Root component
│   │
│   ├── contexts/               # React Context providers
│   │   ├── HARContext.tsx     # HAR data management
│   │   └── ThemeContext.tsx   # Theme provider
│   │
│   ├── stores/                 # Zustand state stores
│   │   ├── customFiltersStore.ts  # Custom filters
│   │   ├── themeStore.ts       # Theme persistence
│   │   └── settingsStore.ts    # Cursor integration settings
│   │
│   ├── services/               # External service integrations
│   │   └── mcpClient.ts        # MCP HTTP client for Cursor
│   │
│   ├── types/                  # TypeScript definitions
│   │   ├── har.types.ts       # HAR 1.2 spec types
│   │   ├── filters.ts         # Filter types
│   │   └── index.ts           # Type exports
│   │
│   ├── utils/                  # Utility functions
│   │   ├── harParser.ts       # HAR parsing & validation
│   │   ├── filterUtils.ts     # Filter logic
│   │   └── waterfallCalculations.ts  # Timing math
│   │
│   ├── styles/                 # Theme and styling
│   │   ├── theme.ts           # Theme definitions
│   │   ├── GlobalStyles.ts    # Global CSS
│   │   └── styled.d.ts        # TypeScript augmentation
│   │
│   ├── main.tsx               # React root setup
│   └── index.css              # Base styles
│
├── public/                     # Static assets
├── index.html                 # HTML entry point
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript config
├── tsconfig.app.json          # App-specific TS config
├── tsconfig.node.json         # Node-specific TS config
├── eslint.config.js           # ESLint configuration
├── package.json               # Dependencies & scripts
└── README.md                  # This file
```

## 📖 Usage

### Uploading a HAR File

1. **Drag and Drop**: Drag a `.har` or `.json` file onto the upload area
2. **Click to Browse**: Click the upload area to select a file from your system

**Supported Files:**
- `.har` files (HTTP Archive format)
- `.json` files (must follow HAR 1.2 specification)
- Maximum size: 50MB

### Using Filters

#### Built-in Filters

Click any built-in filter to view specific request types:
- **All Requests**: Show all network requests
- **4xx Errors**: Client-side errors (404, 401, etc.)
- **5xx Errors**: Server-side errors (500, 502, etc.)
- **Other Errors**: Failed requests and other errors

#### Custom Filters

1. Click **"+ Add Custom Filter"** button
2. Fill in the filter details:
   - **Name**: A descriptive name for your filter
   - **Icon**: Single emoji character (optional)
   - **Pattern Type**:
     - **Path Match**: Simple substring matching (e.g., `/api/users/`)
     - **Regex**: Advanced pattern matching (e.g., `/api/users/\d+`)
   - **Pattern**: The matching pattern
   - **Description**: What this filter does

3. Click **"Save Filter"** to create
4. Your filter will appear in the sidebar with a live count

**Managing Filters:**
- **Edit**: Click the ✏️ icon on hover
- **Delete**: Click the 🗑️ icon on hover
- Filters persist across sessions

### Navigating JSON with Breadcrumbs

When viewing request payloads or response bodies:

1. **Search Method**:
   - Type a search term in the JSON search box
   - Navigate between matches with Previous/Next
   - Breadcrumb shows: `Path: root > response > data > users > [0] > name`

2. **Click Method**:
   - Click any JSON value (string, number, boolean, null)
   - A blinking cursor appears at the value
   - Breadcrumb shows the full path to that value

3. **Navigate Up**:
   - Click any segment in the breadcrumb
   - JSON collapses to show only that level
   - Useful for exploring large JSON structures

### Reading Waterfall Charts

The waterfall chart shows request timing in color-coded segments:

| Color | Phase | Description |
|-------|-------|-------------|
| 🔘 Gray | **Blocked** | Time spent in browser queue |
| 🟢 Green | **DNS** | DNS lookup time |
| 🟠 Orange | **Connect** | TCP connection time |
| 🔴 Red | **SSL** | SSL/TLS handshake |
| 🔵 Cyan | **Send** | Request send time |
| 🟡 Yellow | **Wait** | Time to First Byte (TTFB) |
| 🔵 Blue | **Receive** | Response download time |

**Tips:**
- Hover over segments for exact timing values
- Click a row to expand and see full request details
- Use the timeline markers at the top for reference
- Long wait times may indicate server processing issues
- Large receive times suggest big response payloads

### Switching Views

Toggle between visualizations using the view buttons in the header:

- **📋 Table**: Tabular data view with split-panel details (default view)
- **🌊 Waterfall**: Timeline-based visualization with request breakdown
- **📊 Statistics**: Performance dashboard with comprehensive metrics

### Using the Request Inspector

Click any request to open the detailed inspector with these tabs:

1. **General**: Overview of request/response (URL, method, status, size, timing)
2. **Headers**: All request and response headers in tables
3. **Cookies**: Cookies sent and received
4. **Payload**: Request body (with JSON viewer for JSON content)
5. **Response**: Response body (with JSON viewer for JSON content)
6. **Timings**: Visual breakdown of all timing phases

### Theme Switching

Click the theme toggle button (🌙/☀️) in the header to switch between:
- **Light Mode**: High contrast for bright environments
- **Dark Mode**: Reduced eye strain for low-light environments

Your preference is saved and will persist across sessions.

### Setting Up Cursor IDE Integration

The Cursor IDE integration allows you to send API call data from HAR Viewer directly to Cursor for AI-powered analysis using the Model Context Protocol (MCP).

#### Prerequisites

1. **MCP Server**: You need a running MCP HTTP server (typically part of the har-viewer MCP package)
2. **Cursor IDE**: Cursor must be configured to connect to the MCP server
3. **Same Machine**: Both browser and MCP server must run on localhost

#### Setup Steps

1. **Start the MCP Server**:
   ```bash
   # In your MCP server directory
   pnpm run start:http
   ```
   The server will start on `http://localhost:3100`

2. **Enable Integration**:
   - Click the Settings button (⚙️) in the HAR Viewer header
   - Toggle "Enable Cursor Integration" to ON
   - The status badge will show:
     - 🟢 **Green**: Connected successfully
     - 🔴 **Red**: Server not reachable (check if MCP server is running)
     - 🟡 **Yellow**: Checking connection

3. **Send API Call to Cursor**:
   - Load a HAR file in the viewer
   - Click on any API request to open the inspector
   - Click the **"Send to Cursor"** button in the tab bar
   - The button will show:
     - "Sending..." while transmitting
     - "Sent!" in green on success
     - "Failed" in red if there's an error

4. **Analyze in Cursor**:
   - Open Cursor IDE
   - The API call data is now available via MCP tools
   - Use Cursor's AI to analyze the request/response

#### Troubleshooting

- **Disconnected Status**: Verify MCP server is running with `pnpm run start:http`
- **Button Not Visible**: Check that integration is enabled in settings
- **Send Failed**: Click "Test Connection" in settings modal to diagnose
- **Port Conflicts**: Ensure port 3100 is not in use by another application

#### Settings Modal Features

- **Visual Setup Guide**: 3-step illustrated workflow
- **Connection Status**: Real-time server connectivity monitoring
- **Test Connection**: Manual health check with loading animation
- **MCP Server URL**: Display and copy server URL to clipboard
- **Last Checked**: Shows when connection was last verified
- **Requirements**: Collapsible section listing all prerequisites

The integration settings are saved in your browser's localStorage and will persist across sessions.

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server with HMR

# Building
npm run build        # Type-check and build for production
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint on all files
```

### Adding a New Component

1. Create component file in `src/components/`
2. Use styled-components for styling
3. Import and use theme from styled-components
4. Export component as named export
5. Add to relevant parent component

Example:

```typescript
import styled from 'styled-components';

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

interface MyComponentProps {
  title: string;
}

export const MyComponent = ({ title }: MyComponentProps) => {
  return <Container>{title}</Container>;
};
```

### Code Style Guidelines

- **TypeScript**: Use explicit types, avoid `any`
- **Components**: Functional components with hooks
- **Styling**: Styled-components with theme values
- **Props**: Use transient props (`$prop`) for styling-only props
- **State**: Context for app-wide state, Zustand for persistence
- **File Naming**: PascalCase for components, camelCase for utilities
- **Imports**: Use path aliases (`@components`, `@types`, `@utils`)

### Type Safety

All components should be fully typed:

```typescript
// Good
interface Props {
  data: string;
  onClose: () => void;
}

export const Component = ({ data, onClose }: Props) => { ... }

// Avoid
export const Component = ({ data, onClose }: any) => { ... }
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Contribution Guidelines

- Follow existing code style and conventions
- Add TypeScript types for all new code
- Test your changes thoroughly
- Update documentation if needed
- Keep commits focused and descriptive

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- HAR 1.2 Specification: [W3C HAR Spec](http://www.softwareishard.com/blog/har-12-spec/)
- React Team for React 19
- Vite Team for the amazing build tool
- Styled Components community

## 📞 Support

If you encounter any issues or have questions:

- **Issues**: [GitHub Issues](https://github.com/yourusername/har-viewer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/har-viewer/discussions)

---

**Built with ❤️ using React, TypeScript, and Vite**
