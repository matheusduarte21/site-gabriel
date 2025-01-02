import { ServiceCall } from '../../lib/mockData';

export interface ServiceCallListProps {
  title: string;
  calls: ServiceCall[];
  badgeColor: string;
}

export interface ServiceCallSectionProps {
  title: string;
  calls: ServiceCall[];
  badgeColor: string;
  onCallSelect: (call: ServiceCall) => void;
}