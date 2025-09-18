import React, { useState } from 'react';
import { Users, GraduationCap, Download, Upload, Edit, Trash2, Eye } from 'lucide-react';
import FamilyDetails from './FamilyDetails';
import ClassDetails from './ClassDetails';
import { FamilyData } from '../types';

interface ReportsProps {
  families: FamilyData[];
  onUpdateFamily: (id: string, data: Partial<FamilyData>) => void;
  onDeleteFamily: (id: string) => void;
  onAddFamily: (family: Omit<FamilyData, 'id'>) => FamilyData;
  isNicExists: (nic: string, excludeId?: string) => boolean;
  isAdmissionNumberExists: (admissionNumber: string, excludeId?: string) => boolean;
}

const Reports: React.FC<ReportsProps> = ({
  families,
  onUpdateFamily,
  onDeleteFamily,
  onAddFamily,
  isNicExists,
  isAdmissionNumberExists,
}) => {
  const [activeSubSection, setActiveSubSection] = useState<'family' | 'class'>('family');

  const subSections = [
    { id: 'family', name: 'Family Details', icon: Users },
    { id: 'class', name: 'Class Details', icon: GraduationCap },
  ];

  const renderContent = () => {
    switch (activeSubSection) {
      case 'family':
        return (
          <FamilyDetails
            families={families}
            onUpdateFamily={onUpdateFamily}
            onDeleteFamily={onDeleteFamily}
            onAddFamily={onAddFamily}
            isNicExists={isNicExists}
            isAdmissionNumberExists={isAdmissionNumberExists}
          />
        );
      case 'class':
        return <ClassDetails families={families} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Reports</h2>
        <p className="text-gray-600">View and manage family registration data</p>
      </div>

      {/* Sub-navigation */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {subSections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSubSection(section.id as any)}
                className={`
                  flex items-center px-4 py-2 rounded-lg font-medium transition-colors duration-200
                  ${activeSubSection === section.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-300'
                  }
                `}
              >
                <Icon className="h-4 w-4 mr-2" />
                {section.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default Reports;