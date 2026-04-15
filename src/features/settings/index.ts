/**
 * Settings Feature Exports
 */

// Components
export { default as SettingsView } from './components/SettingsView';

// Types
export interface SettingsProps {
  currentMapping?: any;
  onMappingChange?: (mapping: any) => void;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  language: 'de' | 'en';
  autoSave: boolean;
  notifications: boolean;
}
