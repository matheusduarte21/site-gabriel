import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ServiceCall } from '../../lib/mockData';
import ServiceCallModal from '../admin/ServiceCallModal';
import ServiceCallSection from './ServiceCallSection';
import StatusIndicator from '../shared/StatusIndicador';
import { ServiceCallListProps } from './types';

const ServiceCallList = ({ title, calls, badgeColor }: ServiceCallListProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedCall, setSelectedCall] = useState<ServiceCall | null>(null);

  return (
    <div className="bg-white rounded-lg shadow">
      <div
        className="px-4 py-5 border-b border-gray-200 sm:px-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <ServiceCallSection
            title={title}
            calls={calls}
            badgeColor={badgeColor}
            onCallSelect={setSelectedCall}
          />
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="divide-y divide-gray-200">
          {calls.map((call) => (
            <div
              key={call.id}
              className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
              onClick={() => setSelectedCall(call)}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900">
                      {call.client}
                    </p>
                    <StatusIndicator status={call.status} />
                  </div>
                  <p className="text-sm text-gray-500">
                    {call.ticketNumber} • {new Date(call.datetime).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="text-sm text-right">
                  <p className="text-gray-900 font-medium">{call.analyst}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCall && (
        <ServiceCallModal
          serviceCall={selectedCall}
          onClose={() => setSelectedCall(null)}
        />
      )}
    </div>
  );
};

export default ServiceCallList;