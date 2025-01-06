import { ServiceCall } from '../../lib/mockData';

export interface ServiceCallListProps {
  title: string;
  calls: any[];
  badgeColor: string;
}

export interface ServiceCallSectionProps {
  title: string;
  calls: any[];
  badgeColor: string;
  onCallSelect: (call: ServiceCall) => void;
}