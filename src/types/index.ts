export interface Student {
  name: string;
  admissionNumber: string;
  class: string;
}

export interface FamilyData {
  id: string;
  guardianNic: string;
  guardianName: string;
  primaryStudent: Student;
  siblings: Student[];
  createdAt: Date;
}