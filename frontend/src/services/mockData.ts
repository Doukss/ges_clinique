import type { Department, Employee, Project, Assignment } from "../types";

// Initial mock data
const initialDepartments: Department[] = [
  { id: 1, code: "DSI", libelle: "Direction des Systèmes d'Information" },
  { id: 2, code: "RH", libelle: "Ressources Humaines" },
  { id: 3, code: "FIN", libelle: "Finance" },
  { id: 4, code: "MKT", libelle: "Marketing" },
];

const initialEmployees: Employee[] = [
  {
    id: 1,
    prenom: "Jean",
    nom: "Dupont",
    email: "jean.dupont@tech221.com",
    telephone: "0612345678",
    departementId: 1,
  },
  {
    id: 2,
    prenom: "Marie",
    nom: "Martin",
    email: "marie.martin@tech221.com",
    telephone: "0623456789",
    departementId: 1,
  },
  {
    id: 3,
    prenom: "Pierre",
    nom: "Bernard",
    email: "pierre.bernard@tech221.com",
    telephone: "0634567890",
    departementId: 2,
  },
  {
    id: 4,
    prenom: "Sophie",
    nom: "Dubois",
    email: "sophie.dubois@tech221.com",
    telephone: "0645678901",
    departementId: 3,
  },
  {
    id: 5,
    prenom: "Lucas",
    nom: "Moreau",
    email: "lucas.moreau@tech221.com",
    telephone: "0656789012",
    departementId: 4,
  },
];

const initialProjects: Project[] = [
  {
    id: 1,
    nom: "Site Web Corporate",
    description: "Refonte du site web de l'entreprise",
    dateDebut: "2026-01-15",
    dateFin: "2026-06-30",
    statut: "EN_COURS",
  },
  {
    id: 2,
    nom: "Application Mobile",
    description: "Développement d'une application mobile",
    dateDebut: "2026-02-01",
    dateFin: "2026-12-31",
    statut: "EN_COURS",
  },
  {
    id: 3,
    nom: "Système de Facturation",
    description: "Nouveau système de facturation",
    dateDebut: "2025-11-01",
    dateFin: "2026-03-15",
    statut: "TERMINE",
  },
  {
    id: 4,
    nom: "Campagne Marketing",
    description: "Campagne marketing pour 2026",
    dateDebut: "2026-01-01",
    dateFin: null,
    statut: "BROUILLON",
  },
];

const initialAssignments: Assignment[] = [
  {
    id: 1,
    employeId: 1,
    projetId: 1,
    role: "Chef de Projet",
    dateAffectation: "2026-01-15",
  },
  {
    id: 2,
    employeId: 2,
    projetId: 1,
    role: "Développeur",
    dateAffectation: "2026-01-20",
  },
  {
    id: 3,
    employeId: 1,
    projetId: 2,
    role: "Chef de Projet",
    dateAffectation: "2026-02-01",
  },
  {
    id: 4,
    employeId: 5,
    projetId: 4,
    role: "Responsable Marketing",
    dateAffectation: "2026-01-10",
  },
];

// Local storage keys
const STORAGE_KEYS = {
  DEPARTMENTS: "tech221_departments",
  EMPLOYEES: "tech221_employees",
  PROJECTS: "tech221_projects",
  ASSIGNMENTS: "tech221_assignments",
};

// Helper to get data from localStorage
const getData = <T>(key: string, initialData: T): T => {
  const stored = localStorage.getItem(key);
  if (stored) {
    return JSON.parse(stored);
  }
  // Initialize with default data
  localStorage.setItem(key, JSON.stringify(initialData));
  return initialData;
};

// Helper to save data to localStorage
const saveData = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Generate next ID
const getNextId = <T extends { id: number }>(items: T[]): number => {
  if (items.length === 0) return 1;
  return Math.max(...items.map((item) => item.id)) + 1;
};

// Department CRUD operations
export const departmentService = {
  getAll: (): Department[] => {
    const departments = getData(STORAGE_KEYS.DEPARTMENTS, initialDepartments);
    return departments.filter((d) => !d.archived);
  },

  getById: (id: number): Department | undefined => {
    const departments = getData(STORAGE_KEYS.DEPARTMENTS, initialDepartments);
    return departments.find((d) => d.id === id && !d.archived);
  },

  create: (data: Omit<Department, "id">): Department => {
    const departments = getData(STORAGE_KEYS.DEPARTMENTS, initialDepartments);

    // Check if code already exists
    if (departments.some((d) => d.code === data.code)) {
      throw new Error("Le code du département existe déjà");
    }

    const newDepartment: Department = {
      ...data,
      id: getNextId(departments),
      createdAt: new Date().toISOString(),
    };

    departments.push(newDepartment);
    saveData(STORAGE_KEYS.DEPARTMENTS, departments);
    return newDepartment;
  },

  update: (id: number, data: Partial<Department>): Department => {
    const departments = getData(STORAGE_KEYS.DEPARTMENTS, initialDepartments);
    const index = departments.findIndex((d) => d.id === id);

    if (index === -1) throw new Error("Département non trouvé");

    // Check if code already exists (excluding current department)
    if (
      data.code &&
      departments.some((d) => d.code === data.code && d.id !== id)
    ) {
      throw new Error("Le code du département existe déjà");
    }

    departments[index] = {
      ...departments[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    saveData(STORAGE_KEYS.DEPARTMENTS, departments);
    return departments[index];
  },

  archive: (id: number): void => {
    const departments = getData(STORAGE_KEYS.DEPARTMENTS, initialDepartments);
    const employees = employeeService.getAll();

    // Check if department has employees
    if (employees.some((e) => e.departementId === id)) {
      throw new Error("Impossible d'archiver un département avec des employés");
    }

    const index = departments.findIndex((d) => d.id === id);
    if (index === -1) throw new Error("Département non trouvé");

    departments[index].archived = true;
    departments[index].updatedAt = new Date().toISOString();
    saveData(STORAGE_KEYS.DEPARTMENTS, departments);
  },

  getAllWithArchived: (): Department[] => {
    return getData(STORAGE_KEYS.DEPARTMENTS, initialDepartments);
  },
};

// Employee CRUD operations
export const employeeService = {
  getAll: (): Employee[] => {
    const employees = getData(STORAGE_KEYS.EMPLOYEES, initialEmployees);
    const departments = departmentService.getAll();

    return employees.map((emp) => ({
      ...emp,
      departement: departments.find((d) => d.id === emp.departementId),
    }));
  },

  getById: (id: number): Employee | undefined => {
    const employees = getData(STORAGE_KEYS.EMPLOYEES, initialEmployees);
    const emp = employees.find((e) => e.id === id);
    if (!emp) return undefined;

    const department = departmentService.getById(emp.departementId);
    return { ...emp, departement: department };
  },

  create: (data: Omit<Employee, "id">): Employee => {
    const employees = getData(STORAGE_KEYS.EMPLOYEES, initialEmployees);

    // Check if email already exists
    if (employees.some((e) => e.email === data.email)) {
      throw new Error("L'email existe déjà");
    }

    // Check if department exists
    if (!departmentService.getById(data.departementId)) {
      throw new Error("Le département n'existe pas");
    }

    // Validate phone (at least 6 digits)
    const phoneDigits = data.telephone.replace(/\D/g, "");
    if (phoneDigits.length < 6) {
      throw new Error("Le téléphone doit contenir au moins 6 chiffres");
    }

    const newEmployee: Employee = {
      ...data,
      id: getNextId(employees),
      createdAt: new Date().toISOString(),
    };

    employees.push(newEmployee);
    saveData(STORAGE_KEYS.EMPLOYEES, employees);
    return newEmployee;
  },

  update: (id: number, data: Partial<Employee>): Employee => {
    const employees = getData(STORAGE_KEYS.EMPLOYEES, initialEmployees);
    const index = employees.findIndex((e) => e.id === id);

    if (index === -1) throw new Error("Employé non trouvé");

    // Check if email already exists (excluding current employee)
    if (
      data.email &&
      employees.some((e) => e.email === data.email && e.id !== id)
    ) {
      throw new Error("L'email existe déjà");
    }

    // Validate phone if provided
    if (data.telephone) {
      const phoneDigits = data.telephone.replace(/\D/g, "");
      if (phoneDigits.length < 6) {
        throw new Error("Le téléphone doit contenir au moins 6 chiffres");
      }
    }

    // Check department if provided
    if (data.departementId && !departmentService.getById(data.departementId)) {
      throw new Error("Le département n'existe pas");
    }

    employees[index] = {
      ...employees[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    saveData(STORAGE_KEYS.EMPLOYEES, employees);
    return employees[index];
  },

  delete: (id: number): void => {
    const employees = getData(STORAGE_KEYS.EMPLOYEES, initialEmployees);
    const assignments = assignmentService.getAll();

    // Check if employee has assignments
    if (assignments.some((a) => a.employeId === id)) {
      throw new Error(
        "Impossible de supprimer un employé avec des affectations",
      );
    }

    const index = employees.findIndex((e) => e.id === id);
    if (index === -1) throw new Error("Employé non trouvé");

    employees.splice(index, 1);
    saveData(STORAGE_KEYS.EMPLOYEES, employees);
  },

  getByDepartment: (departmentId: number): Employee[] => {
    const employees = employeeService.getAll();
    return employees.filter((e) => e.departementId === departmentId);
  },
};

// Project CRUD operations
export const projectService = {
  getAll: (): Project[] => {
    return getData(STORAGE_KEYS.PROJECTS, initialProjects);
  },

  getById: (id: number): Project | undefined => {
    const projects = getData(STORAGE_KEYS.PROJECTS, initialProjects);
    return projects.find((p) => p.id === id);
  },

  create: (data: Omit<Project, "id">): Project => {
    const projects = getData(STORAGE_KEYS.PROJECTS, initialProjects);

    // Validate required fields
    if (!data.nom || data.nom.trim() === "") {
      throw new Error("Le nom du projet est obligatoire");
    }

    // Validate dateDebut
    if (!data.dateDebut) {
      throw new Error("La date de début est obligatoire");
    }

    // Validate dateFin >= dateDebut if provided
    if (data.dateFin && data.dateFin < data.dateDebut) {
      throw new Error(
        "La date de fin doit être postérieure à la date de début",
      );
    }

    // Validate status
    if (!["BROUILLON", "EN_COURS", "TERMINE", "ANNULE"].includes(data.statut)) {
      throw new Error("Statut invalide");
    }

    const newProject: Project = {
      ...data,
      id: getNextId(projects),
      createdAt: new Date().toISOString(),
    };

    projects.push(newProject);
    saveData(STORAGE_KEYS.PROJECTS, projects);
    return newProject;
  },

  update: (id: number, data: Partial<Project>): Project => {
    const projects = getData(STORAGE_KEYS.PROJECTS, initialProjects);
    const index = projects.findIndex((p) => p.id === id);

    if (index === -1) throw new Error("Projet non trouvé");

    // Validate required fields
    if (data.nom !== undefined && data.nom.trim() === "") {
      throw new Error("Le nom du projet est obligatoire");
    }

    // Validate dateDebut
    if (data.dateDebut === "") {
      throw new Error("La date de début est obligatoire");
    }

    // Validate dateFin >= dateDebut if provided
    const dateDebut = data.dateDebut || projects[index].dateDebut;
    if (
      data.dateFin !== undefined &&
      data.dateFin &&
      data.dateFin < dateDebut
    ) {
      throw new Error(
        "La date de fin doit être postérieure à la date de début",
      );
    }

    // Validate status
    if (
      data.statut &&
      !["BROUILLON", "EN_COURS", "TERMINE", "ANNULE"].includes(data.statut)
    ) {
      throw new Error("Statut invalide");
    }

    // Check if can set to TERMINE
    if (
      data.statut === "TERMINE" &&
      !data.dateFin &&
      !projects[index].dateFin
    ) {
      throw new Error("Impossible de terminer un projet sans date de fin");
    }

    projects[index] = {
      ...projects[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    saveData(STORAGE_KEYS.PROJECTS, projects);
    return projects[index];
  },

  delete: (id: number): void => {
    const projects = getData(STORAGE_KEYS.PROJECTS, initialProjects);
    const assignments = assignmentService.getAll();

    // Check if project has assignments
    if (assignments.some((a) => a.projetId === id)) {
      throw new Error(
        "Impossible de supprimer un projet avec des affectations",
      );
    }

    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Projet non trouvé");

    projects.splice(index, 1);
    saveData(STORAGE_KEYS.PROJECTS, projects);
  },

  canAddAssignment: (projectId: number): boolean => {
    const project = projectService.getById(projectId);
    if (!project) return false;
    return project.statut !== "TERMINE" && project.statut !== "ANNULE";
  },
};

// Assignment CRUD operations
export const assignmentService = {
  getAll: (): Assignment[] => {
    const assignments = getData(STORAGE_KEYS.ASSIGNMENTS, initialAssignments);
    const employees = employeeService.getAll();
    const projects = projectService.getAll();

    return assignments.map((ass) => ({
      ...ass,
      employe: employees.find((e) => e.id === ass.employeId),
      projet: projects.find((p) => p.id === ass.projetId),
    }));
  },

  getById: (id: number): Assignment | undefined => {
    const assignments = getData(STORAGE_KEYS.ASSIGNMENTS, initialAssignments);
    const ass = assignments.find((a) => a.id === id);
    if (!ass) return undefined;

    return {
      ...ass,
      employe: employeeService.getById(ass.employeId),
      projet: projectService.getById(ass.projetId),
    };
  },

  create: (data: Omit<Assignment, "id">): Assignment => {
    const assignments = getData(STORAGE_KEYS.ASSIGNMENTS, initialAssignments);

    // Check if employee exists
    if (!employeeService.getById(data.employeId)) {
      throw new Error("L'employé n'existe pas");
    }

    // Check if project exists
    if (!projectService.getById(data.projetId)) {
      throw new Error("Le projet n'existe pas");
    }

    // Check if project can accept new assignments
    const project = projectService.getById(data.projetId);
    if (
      project &&
      (project.statut === "TERMINE" || project.statut === "ANNULE")
    ) {
      throw new Error(
        "Impossible d'ajouter une affectation à un projet terminé ou annulé",
      );
    }

    // Check for duplicate (employeId, projetId)
    if (
      assignments.some(
        (a) => a.employeId === data.employeId && a.projetId === data.projetId,
      )
    ) {
      throw new Error("Cet employé est déjà affecté à ce projet");
    }

    // Validate dateAffectation >= dateDebut
    if (project && data.dateAffectation < project.dateDebut) {
      throw new Error(
        "La date d'affectation doit être postérieure ou égale à la date de début du projet",
      );
    }

    const newAssignment: Assignment = {
      ...data,
      id: getNextId(assignments),
      createdAt: new Date().toISOString(),
    };

    assignments.push(newAssignment);
    saveData(STORAGE_KEYS.ASSIGNMENTS, assignments);
    return newAssignment;
  },

  update: (id: number, data: Partial<Assignment>): Assignment => {
    const assignments = getData(STORAGE_KEYS.ASSIGNMENTS, initialAssignments);
    const index = assignments.findIndex((a) => a.id === id);

    if (index === -1) throw new Error("Affectation non trouvée");

    // Check if employee exists if provided
    if (data.employeId && !employeeService.getById(data.employeId)) {
      throw new Error("L'employé n'existe pas");
    }

    // Check if project exists if provided
    if (data.projetId && !projectService.getById(data.projetId)) {
      throw new Error("Le projet n'existe pas");
    }

    assignments[index] = {
      ...assignments[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    saveData(STORAGE_KEYS.ASSIGNMENTS, assignments);
    return assignments[index];
  },

  delete: (id: number): void => {
    const assignments = getData(STORAGE_KEYS.ASSIGNMENTS, initialAssignments);
    const index = assignments.findIndex((a) => a.id === id);

    if (index === -1) throw new Error("Affectation non trouvée");

    assignments.splice(index, 1);
    saveData(STORAGE_KEYS.ASSIGNMENTS, assignments);
  },

  getByProject: (projectId: number): Assignment[] => {
    const assignments = assignmentService.getAll();
    return assignments.filter((a) => a.projetId === projectId);
  },

  getByEmployee: (employeeId: number): Assignment[] => {
    const assignments = assignmentService.getAll();
    return assignments.filter((a) => a.employeId === employeeId);
  },
};

// Stats for dashboard
export const getStats = () => {
  const departments = departmentService.getAll();
  const employees = employeeService.getAll();
  const projects = projectService.getAll();
  const assignments = assignmentService.getAll();

  const activeProjects = projects.filter((p) => p.statut === "EN_COURS").length;
  const completedProjects = projects.filter(
    (p) => p.statut === "TERMINE",
  ).length;

  return {
    totalDepartments: departments.length,
    totalEmployees: employees.length,
    totalProjects: projects.length,
    activeProjects,
    completedProjects,
    totalAssignments: assignments.length,
  };
};

// Reset data to initial state (for testing)
export const resetData = () => {
  localStorage.setItem(
    STORAGE_KEYS.DEPARTMENTS,
    JSON.stringify(initialDepartments),
  );
  localStorage.setItem(
    STORAGE_KEYS.EMPLOYEES,
    JSON.stringify(initialEmployees),
  );
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(initialProjects));
  localStorage.setItem(
    STORAGE_KEYS.ASSIGNMENTS,
    JSON.stringify(initialAssignments),
  );
};
