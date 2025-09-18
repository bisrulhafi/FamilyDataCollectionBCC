import React, { useState } from 'react';
import { GraduationCap, Users, Search } from 'lucide-react';
import { FamilyData } from '../types';

interface ClassDetailsProps {
  families: FamilyData[];
}

const CLASS_OPTIONS = [
  '1A', '1B', '1C', '1D', '1E',
  '2A', '2B', '2C', '2D', '2E',
  '3A', '3B', '3C', '3D', '3E',
  '4A', '4B', '4C', '4D', '4E',
  '5A', '5B', '5C', '5D', '5E',
  '6A', '6B', '6C', '6D', '6E', '6F',
  '7A', '7B', '7C', '7D', '7E', '7F',
  '8A', '8B', '8C', '8D', '8E', '8F',
  '9A', '9B', '9C', '9D', '9E', '9F',
  '10A', '10B', '10C', '10D', '10E', '10F', '10G',
  '11A', '11B', '11C', '11D', '11E', '11F', '11G', '11H',
  '12 Arts', '13 Arts', '12 Com', '13 Com', '12 Tech', '13 Tech',
  '12 Bio', '13 Bio', '12 Maths', '13 Maths'
];

const ClassDetails: React.FC<ClassDetailsProps> = ({ families }) => {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Get all students from all families
  const getAllStudents = () => {
    const students: Array<{ name: string; admissionNumber: string; class: string; familyId: string; guardianName: string }> = [];
    
    families.forEach(family => {
      // Add primary student
      students.push({
        name: family.primaryStudent.name,
        admissionNumber: family.primaryStudent.admissionNumber,
        class: family.primaryStudent.class,
        familyId: family.id,
        guardianName: family.guardianName,
      });
      
      // Add siblings
      family.siblings.forEach(sibling => {
        students.push({
          name: sibling.name,
          admissionNumber: sibling.admissionNumber,
          class: sibling.class,
          familyId: family.id,
          guardianName: family.guardianName,
        });
      });
    });
    
    return students;
  };

  const allStudents = getAllStudents();

  // Get class statistics
  const getClassStats = () => {
    const stats: Record<string, number> = {};
    CLASS_OPTIONS.forEach(cls => {
      stats[cls] = allStudents.filter(student => student.class === cls).length;
    });
    return stats;
  };

  const classStats = getClassStats();

  // Filter classes based on search term
  const filteredClasses = CLASS_OPTIONS.filter(cls =>
    cls.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classStats[cls] > 0
  );

  // Get students for selected class
  const getStudentsInClass = (className: string) => {
    return allStudents.filter(student => student.class === className);
  };

  const studentsInSelectedClass = selectedClass ? getStudentsInClass(selectedClass) : [];

  // Get color for class box based on student count
  const getClassColor = (count: number) => {
    if (count === 0) return 'bg-gray-100 text-gray-500 border-gray-200';
    if (count <= 5) return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
    if (count <= 15) return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100';
    if (count <= 25) return 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100';
    return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100';
  };

  return (
    <div>
      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search classes..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Classes</p>
              <p className="text-3xl font-bold text-gray-900">
                {Object.values(classStats).filter(count => count > 0).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-3xl font-bold text-gray-900">{allStudents.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <GraduationCap className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average per Class</p>
              <p className="text-3xl font-bold text-gray-900">
                {Object.values(classStats).filter(count => count > 0).length > 0
                  ? Math.round(allStudents.length / Object.values(classStats).filter(count => count > 0).length)
                  : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Class Grid */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Classes Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {filteredClasses.map((cls) => {
            const count = classStats[cls];
            const isSelected = selectedClass === cls;
            return (
              <button
                key={cls}
                onClick={() => setSelectedClass(isSelected ? null : cls)}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-200 transform hover:scale-105
                  ${getClassColor(count)}
                  ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                `}
              >
                <div className="text-center">
                  <div className="font-bold text-lg">{cls}</div>
                  <div className="text-sm opacity-75">
                    {count} student{count !== 1 ? 's' : ''}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Class Students */}
      {selectedClass && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Students in Class {selectedClass}
          </h3>
          
          {studentsInSelectedClass.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No students found in this class.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admission Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guardian Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Family ID
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {studentsInSelectedClass
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((student, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.admissionNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.guardianName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.familyId}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClassDetails;