import React, { useState } from 'react';
import { Download, Upload, Edit, Trash2, Eye, Search, Filter } from 'lucide-react';
import EditFamilyModal from './EditFamilyModal';
import { FamilyData } from '../types';

interface FamilyDetailsProps {
  families: FamilyData[];
  onUpdateFamily: (id: string, data: Partial<FamilyData>) => void;
  onDeleteFamily: (id: string) => void;
  onAddFamily: (family: Omit<FamilyData, 'id'>) => FamilyData;
  isNicExists: (nic: string, excludeId?: string) => boolean;
  isAdmissionNumberExists: (admissionNumber: string, excludeId?: string) => boolean;
}

const FamilyDetails: React.FC<FamilyDetailsProps> = ({
  families,
  onUpdateFamily,
  onDeleteFamily,
  onAddFamily,
  isNicExists,
  isAdmissionNumberExists,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingFamily, setEditingFamily] = useState<FamilyData | null>(null);
  const [viewingFamily, setViewingFamily] = useState<FamilyData | null>(null);

  const filteredFamilies = families.filter(family =>
    family.guardianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    family.guardianNic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    family.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    family.primaryStudent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    family.siblings.some(sibling => sibling.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const exportToCSV = () => {
    const csvData = families.map(family => {
      const allStudents = [family.primaryStudent, ...family.siblings];
      return {
        'Family ID': family.id,
        'Guardian NIC': family.guardianNic,
        'Guardian Name': family.guardianName,
        'Students': allStudents.map(s => `${s.name} (${s.admissionNumber} - ${s.class})`).join('; '),
        'Total Children': allStudents.length,
        'Created Date': new Date(family.createdAt).toLocaleDateString(),
      };
    });

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `family-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const jsonData = JSON.stringify(families, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `family-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const importFromJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedData)) {
          // Validate imported data structure
          const validData = importedData.filter(item => 
            item.id && 
            item.guardianNic && 
            item.guardianName && 
            item.primaryStudent &&
            item.primaryStudent.name &&
            item.primaryStudent.admissionNumber &&
            item.primaryStudent.class
          );
          
          if (validData.length === 0) {
            alert('No valid family data found in the imported file.');
            return;
          }
          
          // Check for duplicates with existing data
          const existingNics = families.map(f => f.guardianNic);
          const existingAdmissions = families.flatMap(f => [
            f.primaryStudent.admissionNumber,
            ...f.siblings.map(s => s.admissionNumber)
          ]);
          
          const duplicateNics = validData.filter(item => existingNics.includes(item.guardianNic));
          const duplicateAdmissions = validData.filter(item => {
            const allAdmissions = [item.primaryStudent.admissionNumber, ...item.siblings.map((s: any) => s.admissionNumber)];
            return allAdmissions.some(admission => existingAdmissions.includes(admission));
          });
          
          if (duplicateNics.length > 0 || duplicateAdmissions.length > 0) {
            const message = `Import contains duplicate data:\n${
              duplicateNics.length > 0 ? `- ${duplicateNics.length} families with existing NIC numbers\n` : ''
            }${
              duplicateAdmissions.length > 0 ? `- ${duplicateAdmissions.length} families with existing admission numbers\n` : ''
            }Do you want to skip duplicates and import the rest?`;
            
            if (!confirm(message)) {
              return;
            }
            
            // Filter out duplicates
            const cleanData = validData.filter(item => {
              const hasNicDuplicate = existingNics.includes(item.guardianNic);
              const allAdmissions = [item.primaryStudent.admissionNumber, ...item.siblings.map((s: any) => s.admissionNumber)];
              const hasAdmissionDuplicate = allAdmissions.some(admission => existingAdmissions.includes(admission));
              return !hasNicDuplicate && !hasAdmissionDuplicate;
            });
            
            if (cleanData.length === 0) {
              alert('All data in the import file already exists in the system.');
              return;
            }
            
            importFamilies(cleanData);
          } else {
            importFamilies(validData);
          }
        } else {
          alert('Invalid JSON format. Expected an array of family records.');
        }
      } catch (error) {
        alert('Error parsing JSON file. Please ensure it contains valid JSON data.');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  const importFamilies = (importedFamilies: any[]) => {
    try {
      // Convert imported data to proper format and add to existing families
      const processedFamilies = importedFamilies.map(family => ({
        ...family,
        createdAt: family.createdAt ? new Date(family.createdAt) : new Date(),
        siblings: family.siblings || []
      }));
      
      // Add imported families to the system
      processedFamilies.forEach(family => {
        onAddFamily({
          guardianNic: family.guardianNic,
          guardianName: family.guardianName,
          primaryStudent: family.primaryStudent,
          siblings: family.siblings,
          createdAt: family.createdAt
        });
      });
      
      alert(`Successfully imported ${processedFamilies.length} family records.`);
    } catch (error) {
      console.error('Error importing families:', error);
      alert('Error importing family data. Please check the file format.');
    }
  };

  const handleDelete = (family: FamilyData) => {
    if (window.confirm(`Are you sure you want to delete the family record for ${family.guardianName}? This action cannot be undone.`)) {
      onDeleteFamily(family.id);
    }
  };

  return (
    <div>
      {/* Header with search and actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search families, names, NIC, or ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
            <button
              onClick={exportToJSON}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </button>
            <label className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200 cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Import JSON
              <input
                type="file"
                accept=".json"
                onChange={importFromJSON}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Families</h3>
          <p className="text-2xl font-bold text-gray-900">{families.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
          <p className="text-2xl font-bold text-gray-900">
            {families.reduce((acc, family) => acc + 1 + family.siblings.length, 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500">Filtered Results</h3>
          <p className="text-2xl font-bold text-gray-900">{filteredFamilies.length}</p>
        </div>
      </div>

      {/* Family Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Family ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guardian Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Children
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFamilies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? 'No families found matching your search.' : 'No families registered yet.'}
                  </td>
                </tr>
              ) : (
                filteredFamilies.map((family) => {
                  const allStudents = [family.primaryStudent, ...family.siblings];
                  return (
                    <tr key={family.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {family.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{family.guardianName}</div>
                          <div className="text-sm text-gray-500">NIC: {family.guardianNic}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {allStudents.slice(0, 2).map((student, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span>{student.name}</span>
                              <span className="text-xs text-gray-500 ml-2">({student.class})</span>
                            </div>
                          ))}
                          {allStudents.length > 2 && (
                            <div className="text-xs text-gray-500 mt-1">
                              +{allStudents.length - 2} more
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {allStudents.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setViewingFamily(family)}
                            className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingFamily(family)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                            title="Edit Family"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(family)}
                            className="text-red-600 hover:text-red-900 transition-colors duration-200"
                            title="Delete Family"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingFamily && (
        <EditFamilyModal
          family={editingFamily}
          onSave={(updatedFamily) => {
            onUpdateFamily(editingFamily.id, updatedFamily);
            setEditingFamily(null);
          }}
          onClose={() => setEditingFamily(null)}
          isNicExists={isNicExists}
          isAdmissionNumberExists={isAdmissionNumberExists}
        />
      )}

      {/* View Modal */}
      {viewingFamily && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setViewingFamily(null)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Family Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Family ID:</span> {viewingFamily.id}
                  </div>
                  <div>
                    <span className="font-medium">Guardian:</span> {viewingFamily.guardianName}
                  </div>
                  <div>
                    <span className="font-medium">NIC:</span> {viewingFamily.guardianNic}
                  </div>
                  <div>
                    <span className="font-medium">Students:</span>
                    <ul className="mt-2 space-y-1">
                      <li className="pl-4">• {viewingFamily.primaryStudent.name} - {viewingFamily.primaryStudent.admissionNumber} ({viewingFamily.primaryStudent.class})</li>
                      {viewingFamily.siblings.map((sibling, index) => (
                        <li key={index} className="pl-4">• {sibling.name} - {sibling.admissionNumber} ({sibling.class})</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-medium">Registration Date:</span> {new Date(viewingFamily.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setViewingFamily(null)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyDetails;