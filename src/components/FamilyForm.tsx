import React, { useState } from 'react';
import { Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import { FamilyData, Student } from '../types';

interface FamilyFormProps {
  onAddFamily: (family: Omit<FamilyData, 'id'>) => FamilyData;
  isNicExists: (nic: string) => boolean;
  isAdmissionNumberExists: (admissionNumber: string) => boolean;
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

const FamilyForm: React.FC<FamilyFormProps> = ({
  onAddFamily,
  isNicExists,
  isAdmissionNumberExists,
}) => {
  const [formData, setFormData] = useState({
    guardianNic: '',
    guardianName: '',
    primaryStudent: {
      name: '',
      admissionNumber: '',
      class: '',
    },
    siblings: [] as Student[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'guardianNic':
        if (!value) return 'NIC number is required';
        if (value.length < 10) return 'NIC number must be at least 10 characters';
        if (isNicExists(value)) return 'This NIC number already exists in the system';
        return '';
      case 'guardianName':
        return !value ? 'Guardian name is required' : '';
      case 'primaryStudent.name':
        return !value ? 'Student name is required' : '';
      case 'primaryStudent.admissionNumber':
        if (!value) return 'Admission number is required';
        if (!/^\d{5}$/.test(value)) return 'Admission number must be exactly 5 digits';
        if (isAdmissionNumberExists(value)) return 'This admission number already exists';
        return '';
      case 'primaryStudent.class':
        return !value ? 'Class is required' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      if (field.startsWith('primaryStudent.')) {
        const studentField = field.split('.')[1];
        return {
          ...prev,
          primaryStudent: {
            ...prev.primaryStudent,
            [studentField]: value,
          },
        };
      }
      return { ...prev, [field]: value };
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleInputBlur = (field: string, value: string) => {
    const error = validateField(field, value);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const addSibling = () => {
    setFormData(prev => ({
      ...prev,
      siblings: [...prev.siblings, { name: '', admissionNumber: '', class: '' }],
    }));
  };

  const removeSibling = (index: number) => {
    setFormData(prev => ({
      ...prev,
      siblings: prev.siblings.filter((_, i) => i !== index),
    }));
    // Clear sibling-related errors
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach(key => {
      if (key.startsWith(`sibling.${index}`)) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  };

  const handleSiblingChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      siblings: prev.siblings.map((sibling, i) =>
        i === index ? { ...sibling, [field]: value } : sibling
      ),
    }));

    // Clear error when user starts typing
    const errorKey = `sibling.${index}.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  const handleSiblingBlur = (index: number, field: string, value: string) => {
    let error = '';
    if (field === 'name' && !value) {
      error = 'Sibling name is required';
    } else if (field === 'admissionNumber') {
      if (!value) {
        error = 'Admission number is required';
      } else if (!/^\d{5}$/.test(value)) {
        error = 'Admission number must be exactly 5 digits';
      } else if (isAdmissionNumberExists(value)) {
        error = 'This admission number already exists';
      }
    } else if (field === 'class' && !value) {
      error = 'Class is required';
    }

    if (error) {
      setErrors(prev => ({ ...prev, [`sibling.${index}.${field}`]: error }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate main form fields
    newErrors.guardianNic = validateField('guardianNic', formData.guardianNic);
    newErrors.guardianName = validateField('guardianName', formData.guardianName);
    newErrors['primaryStudent.name'] = validateField('primaryStudent.name', formData.primaryStudent.name);
    newErrors['primaryStudent.admissionNumber'] = validateField('primaryStudent.admissionNumber', formData.primaryStudent.admissionNumber);
    newErrors['primaryStudent.class'] = validateField('primaryStudent.class', formData.primaryStudent.class);

    // Validate siblings
    formData.siblings.forEach((sibling, index) => {
      if (!sibling.name) newErrors[`sibling.${index}.name`] = 'Sibling name is required';
      if (!sibling.admissionNumber) {
        newErrors[`sibling.${index}.admissionNumber`] = 'Admission number is required';
      } else if (!/^\d{5}$/.test(sibling.admissionNumber)) {
        newErrors[`sibling.${index}.admissionNumber`] = 'Admission number must be exactly 5 digits';
      } else if (isAdmissionNumberExists(sibling.admissionNumber)) {
        newErrors[`sibling.${index}.admissionNumber`] = 'This admission number already exists';
      }
      if (!sibling.class) newErrors[`sibling.${index}.class`] = 'Class is required';
    });

    // Filter out empty errors
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const familyData: Omit<FamilyData, 'id'> = {
        guardianNic: formData.guardianNic.trim(),
        guardianName: formData.guardianName.trim(),
        primaryStudent: {
          name: formData.primaryStudent.name.trim(),
          admissionNumber: formData.primaryStudent.admissionNumber.trim(),
          class: formData.primaryStudent.class,
        },
        siblings: formData.siblings.map(sibling => ({
          name: sibling.name.trim(),
          admissionNumber: sibling.admissionNumber.trim(),
          class: sibling.class,
        })),
        createdAt: new Date(),
      };

      const newFamily = onAddFamily(familyData);
      
      // Reset form
      setFormData({
        guardianNic: '',
        guardianName: '',
        primaryStudent: { name: '', admissionNumber: '', class: '' },
        siblings: [],
      });
      setErrors({});
      setSubmitSuccess(true);
      
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting family data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Family Registration Form</h2>
        <p className="text-gray-600">Register a new family and their children</p>
      </div>

      {submitSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          Family registered successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Guardian Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Family Guardian Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NIC Number *
              </label>
              <input
                type="text"
                value={formData.guardianNic}
                onChange={(e) => handleInputChange('guardianNic', e.target.value)}
                onBlur={(e) => handleInputBlur('guardianNic', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.guardianNic ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter NIC number"
              />
              {errors.guardianNic && (
                <p className="mt-1 text-sm text-red-600">{errors.guardianNic}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Father/Mother Name *
              </label>
              <input
                type="text"
                value={formData.guardianName}
                onChange={(e) => handleInputChange('guardianName', e.target.value)}
                onBlur={(e) => handleInputBlur('guardianName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.guardianName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter guardian name"
              />
              {errors.guardianName && (
                <p className="mt-1 text-sm text-red-600">{errors.guardianName}</p>
              )}
            </div>
          </div>
        </div>

        {/* Primary Student */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Primary Student Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Name *
              </label>
              <input
                type="text"
                value={formData.primaryStudent.name}
                onChange={(e) => handleInputChange('primaryStudent.name', e.target.value)}
                onBlur={(e) => handleInputBlur('primaryStudent.name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors['primaryStudent.name'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter student name"
              />
              {errors['primaryStudent.name'] && (
                <p className="mt-1 text-sm text-red-600">{errors['primaryStudent.name']}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admission Number *
              </label>
              <input
                type="text"
                maxLength={5}
                pattern="\d{5}"
                value={formData.primaryStudent.admissionNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  handleInputChange('primaryStudent.admissionNumber', value);
                }}
                onBlur={(e) => handleInputBlur('primaryStudent.admissionNumber', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors['primaryStudent.admissionNumber'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="12345"
              />
              {errors['primaryStudent.admissionNumber'] && (
                <p className="mt-1 text-sm text-red-600">{errors['primaryStudent.admissionNumber']}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class *
              </label>
              <select
                value={formData.primaryStudent.class}
                onChange={(e) => handleInputChange('primaryStudent.class', e.target.value)}
                onBlur={(e) => handleInputBlur('primaryStudent.class', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors['primaryStudent.class'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Select class</option>
                {CLASS_OPTIONS.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              {errors['primaryStudent.class'] && (
                <p className="mt-1 text-sm text-red-600">{errors['primaryStudent.class']}</p>
              )}
            </div>
          </div>
        </div>

        {/* Siblings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Additional Siblings</h3>
            <button
              type="button"
              onClick={addSibling}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Sibling
            </button>
          </div>

          {formData.siblings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No siblings added yet. Click "Add Sibling" to add more children.</p>
          ) : (
            <div className="space-y-4">
              {formData.siblings.map((sibling, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-700">Sibling {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeSibling(index)}
                      className="text-red-600 hover:text-red-800 transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sibling Name *
                      </label>
                      <input
                        type="text"
                        value={sibling.name}
                        onChange={(e) => handleSiblingChange(index, 'name', e.target.value)}
                        onBlur={(e) => handleSiblingBlur(index, 'name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors[`sibling.${index}.name`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Enter sibling name"
                      />
                      {errors[`sibling.${index}.name`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`sibling.${index}.name`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Admission Number *
                      </label>
                      <input
                        type="text"
                        maxLength={5}
                        pattern="\d{5}"
                        value={sibling.admissionNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          handleSiblingChange(index, 'admissionNumber', value);
                        }}
                        onBlur={(e) => handleSiblingBlur(index, 'admissionNumber', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors[`sibling.${index}.admissionNumber`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="12345"
                      />
                      {errors[`sibling.${index}.admissionNumber`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`sibling.${index}.admissionNumber`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Class *
                      </label>
                      <select
                        value={sibling.class}
                        onChange={(e) => handleSiblingChange(index, 'class', e.target.value)}
                        onBlur={(e) => handleSiblingBlur(index, 'class', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors[`sibling.${index}.class`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select class</option>
                        {CLASS_OPTIONS.map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                      {errors[`sibling.${index}.class`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`sibling.${index}.class`]}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center px-8 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-lg font-medium"
          >
            <Save className="h-5 w-5 mr-2" />
            {isSubmitting ? 'Registering...' : 'Register Family'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FamilyForm;