import React, { useState } from 'react';
import { School, LogOut, BarChart3, FileText, Users, Menu, X } from 'lucide-react';
import Overview from './Overview';
import FamilyForm from './FamilyForm';
import Reports from './Reports';
import { FamilyData } from '../types';

interface DashboardProps {
  families: FamilyData[];
  onAddFamily: (family: Omit<FamilyData, 'id'>) => FamilyData;
  onUpdateFamily: (id: string, data: Partial<FamilyData>) => void;
  onDeleteFamily: (id: string) => void;
  onLogout: () => void;
  isNicExists: (nic: string, excludeId?: string) => boolean;
  isAdmissionNumberExists: (admissionNumber: string, excludeId?: string) => boolean;
}

const Dashboard: React.FC<DashboardProps> = ({
  families,
  onAddFamily,
  onUpdateFamily,
  onDeleteFamily,
  onLogout,
  isNicExists,
  isAdmissionNumberExists,
}) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'form' | 'reports'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const singleChildFamilies = families.filter(f => f.siblings.length === 0).length;
  const multiChildFamilies = families.filter(f => f.siblings.length > 0).length;
  const totalFamilies = families.length;

  const navigation = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'form', name: 'Form Section', icon: FileText },
    { id: 'reports', name: 'Report Section', icon: Users },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <Overview
            singleChildFamilies={singleChildFamilies}
            multiChildFamilies={multiChildFamilies}
            totalFamilies={totalFamilies}
          />
        );
      case 'form':
        return (
          <FamilyForm
            onAddFamily={onAddFamily}
            isNicExists={isNicExists}
            isAdmissionNumberExists={isAdmissionNumberExists}
          />
        );
      case 'reports':
        return (
          <Reports
            families={families}
            onUpdateFamily={onUpdateFamily}
            onDeleteFamily={onDeleteFamily}
            onAddFamily={onAddFamily}
            isNicExists={isNicExists}
            isAdmissionNumberExists={isAdmissionNumberExists}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <School className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-lg font-semibold text-gray-800 hidden sm:block">BCC</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id as any);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition-colors duration-200
                  ${activeSection === item.id ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' : 'text-gray-700'}
                `}
              >
                <Icon className="h-5 w-5 mr-3" />
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mr-3 text-gray-500 hover:text-gray-700"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                  Baduriya Central College – Mawanella
                </h1>
                <p className="text-sm text-gray-600 hidden sm:block">Family Data Collection System</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center px-3 py-2 text-gray-700 hover:text-red-600 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="p-4 sm:p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;