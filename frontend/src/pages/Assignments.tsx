import { useEffect, useState, useMemo } from "react";
import Layout from "../components/Layout";
import SearchInput from "../components/SearchInput";
import Pagination from "../components/Pagination";
import {
  assignmentService,
  employeeService,
  projectService,
} from "../services/mockData";
import type { Assignment, Employee, Project } from "../types";

const ITEMS_PER_PAGE = 10;

const Assignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    employeId: 0,
    projetId: 0,
    role: "",
    dateAffectation: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setAssignments(assignmentService.getAll());
    setEmployees(employeeService.getAll());
    setProjects(
      projectService
        .getAll()
        .filter((p) => p.statut !== "TERMINE" && p.statut !== "ANNULE"),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      assignmentService.create(formData);
      setIsModalOpen(false);
      setFormData({ employeId: 0, projetId: 0, role: "", dateAffectation: "" });
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette affectation ?")) {
      try {
        assignmentService.delete(id);
        loadData();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Une erreur est survenue");
      }
    }
  };

  const openNewModal = () => {
    // Refresh projects to get only active ones
    setProjects(
      projectService
        .getAll()
        .filter((p) => p.statut !== "TERMINE" && p.statut !== "ANNULE"),
    );
    setFormData({ employeId: 0, projetId: 0, role: "", dateAffectation: "" });
    setError("");
    setIsModalOpen(true);
  };

  const getSelectedProject = () => {
    return projects.find((p) => p.id === formData.projetId);
  };

  // Filter assignments based on search query
  const filteredAssignments = useMemo(() => {
    if (!searchQuery.trim()) return assignments;
    const query = searchQuery.toLowerCase();
    return assignments.filter(
      (a) =>
        a.employe?.prenom.toLowerCase().includes(query) ||
        a.employe?.nom.toLowerCase().includes(query) ||
        a.employe?.email.toLowerCase().includes(query) ||
        a.projet?.nom.toLowerCase().includes(query) ||
        a.role.toLowerCase().includes(query),
    );
  }, [assignments, searchQuery]);

  // Paginate filtered assignments
  const paginatedAssignments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAssignments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAssignments, currentPage]);

  const totalPages = Math.ceil(filteredAssignments.length / ITEMS_PER_PAGE);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <Layout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mt-8 flex justify-between bg-linear-to-r from-amber-100  to-amber-100 rounded-xl p-6 text-white">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Affectations</h1>
          <p className="text-gray-900 mt-2">
            Gérez les affectations des employés aux projets
          </p>
          </div>
          <div>
            <div className="w-28 h-20 mr-5 bg-amber-700">
              <img src="/projet.jpg" alt="" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mb-8 mt-10">
          <div className="w-72 text-gray-700">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Rechercher une affectation..."
            />
          </div>
          <button
            onClick={openNewModal}
            className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span>Nouvelle affectation</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-amber-100 text-gray-900">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Employé</th>
                <th className="px-6 py-4 text-left font-semibold">Projet</th>
                <th className="px-6 py-4 text-left font-semibold">Rôle</th>
                <th className="px-6 py-4 text-left font-semibold">
                  Date d'affectation
                </th>
                <th className="px-6 py-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {searchQuery
                      ? "Aucune affectation ne correspond à votre recherche."
                      : 'Aucune affectation trouvée. Cliquez sur "Nouvelle\n                    affectation" pour en créer une.'}
                  </td>
                </tr>
              ) : (
                paginatedAssignments.map((assignment) => (
                  <tr
                    key={assignment.id}
                    className="hover:bg-amber-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {assignment.employe?.prenom} {assignment.employe?.nom}
                        </p>
                        <p className="text-sm text-gray-500">
                          {assignment.employe?.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {assignment.projet?.nom}
                        </p>
                        <p className="text-sm text-gray-500">
                          {assignment.projet?.statut === "EN_COURS"
                            ? "En cours"
                            : assignment.projet?.statut}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-violet-100 text-violet-800">
                        {assignment.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(assignment.dateAffectation).toLocaleDateString(
                        "fr-FR",
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(assignment.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredAssignments.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Nouvelle affectation
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employé *
                  </label>
                  <select
                    value={formData.employeId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        employeId: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    required
                  >
                    <option value={0}>Sélectionner un employé</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.prenom} {emp.nom} - {emp.departement?.code}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Projet *
                  </label>
                  <select
                    value={formData.projetId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        projetId: parseInt(e.target.value),
                        dateAffectation: getSelectedProject()?.dateDebut || "",
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    required
                  >
                    <option value={0}>Sélectionner un projet</option>
                    {projects.map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.nom} (
                        {proj.statut === "EN_COURS" ? "En cours" : proj.statut})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rôle *
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Ex: Chef de Projet, Développeur, Comptable"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'affectation *
                  </label>
                  <input
                    type="date"
                    value={formData.dateAffectation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dateAffectation: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    min={getSelectedProject()?.dateDebut}
                    required
                  />
                  {getSelectedProject() && (
                    <p className="text-sm text-gray-500 mt-1">
                      Date de début du projet:{" "}
                      {new Date(
                        getSelectedProject()!.dateDebut,
                      ).toLocaleDateString("fr-FR")}
                    </p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Créer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Assignments;
