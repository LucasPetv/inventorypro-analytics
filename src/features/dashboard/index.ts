/**
 * Dashboard Feature Exports
 */

// Components
export { default as Dashboard } from './components/Dashboard';

// Types
export interface DashboardProps {
  data: any[];
}

export interface KPIMetrics {
  totalItems: number;
  totalValue: number;
  avgRotation: number;
  lowStockItems: number;
}
