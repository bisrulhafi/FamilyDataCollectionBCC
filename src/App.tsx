import React, { useState, useEffect } from 'react';
import { School, Users, FileText, BarChart3 } from 'lucide-react';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import { FamilyData, Student } from './types';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [families, setFamilies] = useState<FamilyData[]>([]);
  const [nextFamilyId, setNextFamilyId] = useState(1);

  useEffect(() => {
    // Load data from localStorage on startup
    const savedFamilies = localStorage.getItem('bcc-families');
    const savedNextId = localStorage.getItem('bcc-next-family-id');
    
    if (savedFamilies) {
      setFamilies(JSON.parse(savedFamilies));
    }
    if (savedNextId) {
      setNextFamilyId(parseInt(savedNextId, 10));
    }

    // Check if already logged in
    const isLoggedIn = localStorage.getItem('bcc-authenticated');
    if (isLoggedIn === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    // Save data to localStorage whenever it changes
    localStorage.setItem('bcc-families', JSON.stringify(families));
    localStorage.setItem('bcc-next-family-id', nextFamilyId.toString());
  }, [families, nextFamilyId]);

  const handleLogin = (success: boolean) => {
    setIsAuthenticated(success);
    if (success) {
      localStorage.setItem('bcc-authenticated', 'true');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('bcc-authenticated');
  };

  const generateFamilyId = (): string => {
    const id = `BCC/24344/${nextFamilyId.toString().padStart(5, '0')}`;
    setNextFamilyId(prev => prev + 1);
    return id;
  };

  const addFamily = (familyData: Omit<FamilyData, 'id'>) => {
    const newFamily: FamilyData = {
      ...familyData,
      id: generateFamilyId(),
    };
    setFamilies(prev => [...prev, newFamily]);
    return newFamily;
  };

  const updateFamily = (id: string, updatedData: Partial<FamilyData>) => {
    setFamilies(prev => prev.map(family => 
      family.id === id ? { ...family, ...updatedData } : family
    ));
  };

  const deleteFamily = (id: string) => {
    setFamilies(prev => prev.filter(family => family.id !== id));
  };

  const isNicExists = (nic: string, excludeId?: string): boolean => {
    return families.some(family => family.guardianNic === nic && family.id !== excludeId);
  };

  const isAdmissionNumberExists = (admissionNumber: string, excludeId?: string): boolean => {
    return families.some(family => {
      const allStudents = [family.primaryStudent, ...family.siblings];
      return allStudents.some(student => student.admissionNumber === admissionNumber) && family.id !== excludeId;
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <School className="h-12 w-12 text-blue-600 mr-3" />
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                  Baduriya Central College – Mawanella
                </h1>
                <p className="text-lg text-gray-600 mt-2">Family Data Collection System</p>
              </div>
            </div>
          </div>
          <LoginForm onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Dashboard
        families={families}
        onAddFamily={addFamily}
        onUpdateFamily={updateFamily}
        onDeleteFamily={deleteFamily}
        onLogout={handleLogout}
        isNicExists={isNicExists}
        isAdmissionNumberExists={isAdmissionNumberExists}
      />
    </div>
  );
}

export default App;