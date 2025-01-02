import React from 'react';
import { ServiceCallSectionProps } from './types';

const ServiceCallSection = ({ title, calls, badgeColor }: ServiceCallSectionProps) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mr-2">
          {title}
        </h3>
        <span className={`${badgeColor} px-2 py-1 rounded-full text-xs font-medium`}>
          {calls.length}
        </span>
      </div>
    </div>
  );
};

export default ServiceCallSection;