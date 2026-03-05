// Data models for TECH 221 application

export interface Department {
  id: number;
  code: string;
  libelle: string;
  archived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Employee {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  departementId: number;
  departement?: Department;
  createdAt?: string;
  updatedAt?: string;
}

export type ProjectStatus = 'BROUILLON' | 'EN_COURS' | 'TERMINE' | 'ANNULE';

export interface Project {
  id: number;
  nom: string;
  description: string;
  dateDebut: string;
  dateFin: string | null;
  statut: ProjectStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Assignment {
  id: number;
  employeId: number;
  employe?: Employee;
  projetId: number;
  projet?: Project;
  role: string;
  dateAffectation: string;
  createdAt?: string;
  updatedAt?: string;
}

// Form data types
export interface DepartmentFormData {
  code: string;
  libelle: string;
}

export interface EmployeeFormData {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  departementId: number;
}

export interface ProjectFormData {
  nom: string;
  description: string;
  dateDebut: string;
  dateFin: string | null;
  statut: ProjectStatus;
}

export interface AssignmentFormData {
  employeId: number;
  projetId: number;
  role: string;
  dateAffectation: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
