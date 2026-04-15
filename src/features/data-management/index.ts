/**
 * Data Management Feature Exports
 */

// Components
export { default as DataInput } from './components/DataInput';
export { default as DatabaseManager } from './components/DatabaseManager';

// Services
export { InventoryService } from './services/inventoryService';

// Types
export interface DataInputProps {
  onDataLoaded: (data: any[], mapping: any) => void;
  currentMapping?: any;
}

export interface ImportResult {
  success: boolean;
  message: string;
  data?: any[];
  errors?: string[];
}
