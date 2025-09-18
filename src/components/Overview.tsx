import React from 'react';
import { Users, UserCheck, UsersIcon } from 'lucide-react';

interface OverviewProps {
  singleChildFamilies: number;
  multiChildFamilies: number;
  totalFamilies: number;
}

const Overview: React.FC<OverviewProps> = ({
  singleChildFamilies,
  multiChildFamilies,
  totalFamilies,
}) => {
  const stats = [
    {
      name: 'Single Child Families',
      value: singleChildFamilies,
      icon: UserCheck,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      name: 'Multi Child Families',
      value: multiChildFamilies,
      icon: Users,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
    },
    {
      name: 'Total Families',
      value: totalFamilies,
      icon: UsersIcon,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Overview</h2>
        <p className="text-gray-600">Family registration statistics and summary</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-center">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-8 w-8 ${stat.textColor}`} />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                    {stat.name}
                  </p>
                  <p className="text-4xl font-bold text-gray-900 mt-1">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700">Total Students</h4>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {totalFamilies > 0 ? 
                totalFamilies + 
                (JSON.parse(localStorage.getItem('bcc-families') || '[]') as any[])
                  .reduce((acc, family) => acc + family.siblings.length, 0) 
                : 0
              }
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700">Average Children per Family</h4>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {totalFamilies > 0 ? 
                (((totalFamilies + 
                  (JSON.parse(localStorage.getItem('bcc-families') || '[]') as any[])
                    .reduce((acc, family) => acc + family.siblings.length, 0)
                ) / totalFamilies)).toFixed(1)
                : '0.0'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;