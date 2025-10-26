export interface EmailTemplate {
  render(data: any): string;
  getSubject(language: 'en' | 'es', ...args: any[]): string;
}

export interface TemplateData {
  language: 'en' | 'es';
  [key: string]: any;
}

export interface BaseTemplateProps {
  title: string;
  preheader: string;
  language: 'en' | 'es';
  unsubscribeUrl?: string;
  dashboardUrl?: string;
}

export const COLORS = {
  primary: '#4f46e5',
  secondary: '#7c3aed',
  success: '#059669',
  warning: '#f59e0b',
  danger: '#dc2626',
  info: '#0891b2',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
} as const;

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
} as const;