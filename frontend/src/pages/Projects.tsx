import { useEffect, useState, useMemo } from "react";
import Layout from "../components/Layout";
import SearchInput from "../components/SearchInput";
import Pagination from "../components/Pagination";
import { projectService, assignmentService } from "../services/mockData";
import type { Project, ProjectStatus } from "../types";

const ITEMS_PER_PAGE = 10;

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    dateDebut: "",
    dateFin: "",
    statut: "BROUILLON" as ProjectStatus,
  });
  const [error, setError] = useState("");
  const [assignmentCounts, setAssignmentCounts] = useState<
    Record<number, number>
  >({});

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const data = projectService.getAll();
    setProjects(data);

    // Get assignment counts for each project
    const counts: Record<number, number> = {};
    data.forEach((proj) => {
      counts[proj.id] = assignmentService.getByProject(proj.id).length;
    });
    setAssignmentCounts(counts);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const projectData = {
        ...formData,
        dateFin: formData.dateFin || null,
      };

      if (editingProject) {
        projectService.update(editingProject.id, projectData);
      } else {
        projectService.create(projectData);
      }
      setIsModalOpen(false);
      setEditingProject(null);
      setFormData({
        nom: "",
        description: "",
        dateDebut: "",
        dateFin: "",
        statut: "BROUILLON",
      });
      loadProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      nom: project.nom,
      description: project.description,
      dateDebut: project.dateDebut,
      dateFin: project.dateFin || "",
      statut: project.statut,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
      try {
        projectService.delete(id);
        loadProjects();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Une erreur est survenue");
      }
    }
  };

  const openNewModal = () => {
    setEditingProject(null);
    setFormData({
      nom: "",
      description: "",
      dateDebut: "",
      dateFin: "",
      statut: "BROUILLON",
    });
    setError("");
    setIsModalOpen(true);
  };

  // Filter projects based on search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const query = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.nom.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.statut.toLowerCase().includes(query),
    );
  }, [projects, searchQuery]);

  // Paginate filtered projects
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const getStatusBadge = (status: ProjectStatus) => {
    const styles: Record<ProjectStatus, string> = {
      BROUILLON: "bg-amber-100 text-amber-800",
      EN_COURS: "bg-blue-100 text-blue-800",
      TERMINE: "bg-green-100 text-green-800",
      ANNULE: "bg-red-100 text-red-800",
    };
    const labels: Record<ProjectStatus, string> = {
      BROUILLON: "Brouillon",
      EN_COURS: "En cours",
      TERMINE: "Terminé",
      ANNULE: "Annulé",
    };
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mt-8 flex justify-between bg-linear-to-r from-green-100  to-green-100 rounded-xl p-6 text-white">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projets</h1>
            <p className="text-gray-900 mt-2">
              Gérez les projets de l'entreprise
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
              placeholder="Rechercher un projet..."
            />
          </div>
          <button
            onClick={openNewModal}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
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
            <span>Nouveau projet</span>
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
            <thead className="bg-green-100 text-gray-900">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Nom</th>
                <th className="px-6 py-4 text-left font-semibold">
                  Description
                </th>
                <th className="px-6 py-4 text-left font-semibold">Dates</th>
                <th className="px-6 py-4 text-left font-semibold">Statut</th>
                <th className="px-6 py-4 text-left font-semibold">
                  Affectations
                </th>
                <th className="px-6 py-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {searchQuery
                      ? "Aucun projet ne correspond à votre recherche."
                      : 'Aucun projet trouvé. Cliquez sur "Nouveau projet" pour en\n                    créer un.'}
                  </td>
                </tr>
              ) : (
                paginatedProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-violet-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{project.nom}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                      {project.description}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="text-sm">
                        <p>
                          Début:{" "}
                          {new Date(project.dateDebut).toLocaleDateString(
                            "fr-FR",
                          )}
                        </p>
                        {project.dateFin && (
                          <p>
                            Fin:{" "}
                            {new Date(project.dateFin).toLocaleDateString(
                              "fr-FR",
                            )}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(project.statut)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {assignmentCounts[project.id] || 0} affectation(s)
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(project)}
                          className="p-2 text-gray-600 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                          title="Modifier"
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                          disabled={assignmentCounts[project.id] > 0}
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
                      </div>
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
          totalItems={filteredProjects.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingProject ? "Modifier le projet" : "Nouveau projet"}
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
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) =>
                      setFormData({ ...formData, nom: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de début *
                    </label>
                    <input
                      type="date"
                      value={formData.dateDebut}
                      onChange={(e) =>
                        setFormData({ ...formData, dateDebut: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      value={formData.dateFin}
                      onChange={(e) =>
                        setFormData({ ...formData, dateFin: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut *
                  </label>
                  <select
                    value={formData.statut}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        statut: e.target.value as ProjectStatus,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="BROUILLON">Brouillon</option>
                    <option value="EN_COURS">En cours</option>
                    <option value="TERMINE">Terminé</option>
                    <option value="ANNULE">Annulé</option>
                  </select>
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
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {editingProject ? "Mettre à jour" : "Créer"}
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

export default Projects;
