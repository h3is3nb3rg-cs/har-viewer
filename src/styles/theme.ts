interface Theme {
  name: 'light' | 'dark';
  colors: {
    // Background colors
    background: string;
    backgroundSecondary: string;
    backgroundTertiary: string;

    // Text colors
    text: string;
    textSecondary: string;
    textMuted: string;

    // UI colors
    border: string;
    borderLight: string;
    hover: string;
    selected: string;

    // Status colors
    success: string;
    warning: string;
    error: string;
    info: string;

    // Connection status colors
    statusConnected: string;
    statusDisconnected: string;
    statusDisabled: string;
    statusChecking: string;

    // HTTP Status code colors
    status2xx: string;
    status3xx: string;
    status4xx: string;
    status5xx: string;

    // Resource type colors (for waterfall)
    html: string;
    css: string;
    javascript: string;
    image: string;
    font: string;
    xhr: string;
    media: string;
    other: string;

    // Timing colors (for waterfall segments)
    blocked: string;
    dns: string;
    connect: string;
    send: string;
    wait: string;
    receive: string;
    ssl: string;

    // Accent colors
    primary: string;
    primaryHover: string;
    accent: string;
  };

  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };

  typography: {
    fontFamily: string;
    fontFamilyMono: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };

  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };

  shadows: {
    sm: string;
    md: string;
    lg: string;
  };

  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
}

const lightTheme: Theme = {
  name: 'light',
  colors: {
    background: '#ffffff',
    backgroundSecondary: '#f8f9fa',
    backgroundTertiary: '#f1f3f5',

    text: '#212529',
    textSecondary: '#495057',
    textMuted: '#868e96',

    border: '#dee2e6',
    borderLight: '#e9ecef',
    hover: '#e9ecef',
    selected: '#e7f5ff',

    success: '#37b24d',
    warning: '#f59f00',
    error: '#f03e3e',
    info: '#1c7ed6',

    statusConnected: '#10b981',
    statusDisconnected: '#ef4444',
    statusDisabled: '#9ca3af',
    statusChecking: '#f59e0b',

    status2xx: '#37b24d',
    status3xx: '#4dabf7',
    status4xx: '#ffa94d',
    status5xx: '#ff6b6b',

    html: '#e03131',
    css: '#1c7ed6',
    javascript: '#f59f00',
    image: '#7950f2',
    font: '#e64980',
    xhr: '#12b886',
    media: '#ff6b6b',
    other: '#868e96',

    blocked: '#6c757d',
    dns: '#20c997',
    connect: '#fd7e14',
    send: '#0dcaf0',
    wait: '#ffc107',
    receive: '#0d6efd',
    ssl: '#d63384',

    primary: '#228be6',
    primaryHover: '#1c7ed6',
    accent: '#4c6ef5',
  },

  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    xxl: '3rem',     // 48px
  },

  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontFamilyMono: '"JetBrains Mono", "Fira Code", "Courier New", monospace',
    fontSize: {
      xs: '0.75rem',   // 12px
      sm: '0.875rem',  // 14px
      md: '1rem',      // 16px
      lg: '1.125rem',  // 18px
      xl: '1.25rem',   // 20px
      xxl: '1.5rem',   // 24px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  borderRadius: {
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '1rem',      // 16px
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },

  transitions: {
    fast: '100ms ease-in-out',
    normal: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },
};

const darkTheme: Theme = {
  name: 'dark',
  colors: {
    background: '#1a1b1e',
    backgroundSecondary: '#25262b',
    backgroundTertiary: '#2c2e33',

    text: '#e9ecef',
    textSecondary: '#c1c2c5',
    textMuted: '#909296',

    border: '#373a40',
    borderLight: '#2c2e33',
    hover: '#2c2e33',
    selected: '#1e3a5f',

    success: '#51cf66',
    warning: '#ffd43b',
    error: '#ff6b6b',
    info: '#4dabf7',

    statusConnected: '#10b981',
    statusDisconnected: '#ef4444',
    statusDisabled: '#6b7280',
    statusChecking: '#f59e0b',

    status2xx: '#51cf66',
    status3xx: '#74c0fc',
    status4xx: '#ffd43b',
    status5xx: '#ff8787',

    html: '#ff6b6b',
    css: '#4dabf7',
    javascript: '#ffd43b',
    image: '#9775fa',
    font: '#ff6be0',
    xhr: '#20c997',
    media: '#ff8787',
    other: '#adb5bd',

    blocked: '#868e96',
    dns: '#38d9a9',
    connect: '#ff922b',
    send: '#3bc9db',
    wait: '#ffe066',
    receive: '#5c7cfa',
    ssl: '#f783ac',

    primary: '#4dabf7',
    primaryHover: '#74c0fc',
    accent: '#748ffc',
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },

  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontFamilyMono: '"JetBrains Mono", "Fira Code", "Courier New", monospace',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      xxl: '1.5rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.25)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.35), 0 4px 6px -2px rgba(0, 0, 0, 0.25)',
  },

  transitions: {
    fast: '100ms ease-in-out',
    normal: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },
};

export type { Theme };
export { lightTheme, darkTheme };
