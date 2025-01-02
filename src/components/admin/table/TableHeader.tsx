import React from "react";

interface TableWithStyledHeadersProps {
  headers: string[];
}

const TableWithStyledHeaders = ({ headers }: TableWithStyledHeadersProps) => {
  return (
    <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
      <tr>
        {headers.map((header, index) => (
          <th
            key={index}
            className="py-3 px-6 border-b font-semibold text-left"
          >
            {header}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableWithStyledHeaders;
