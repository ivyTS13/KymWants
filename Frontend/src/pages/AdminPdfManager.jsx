import React, { useState, useEffect } from "react";
import apiClient from "../api/axios";
import Layout from "../components/KymLayout";

export default function AdminPdfManager() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingName, setDeletingName] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Modal State for Custom Delete Confirmation
  const [documentToDelete, setDocumentToDelete] = useState(null);

  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/Documents");
      setDocuments(response.data);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to load PDF documents."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.endsWith(".pdf")) {
        setMessage({ type: "error", text: "Only PDF files are allowed." });
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setMessage({ type: "", text: "" });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setIsUploading(true);
      setMessage({ type: "", text: "" });

      const response = await apiClient.post("/Documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setMessage({ type: "success", text: response.data.message });
      setSelectedFile(null);
      e.target.reset();
      await fetchDocuments();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to upload document."
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Triggers the actual delete API call after user confirms in modal
  const executeDelete = async () => {
    if (!documentToDelete) return;

    const nameToDelete = documentToDelete;
    try {
      setDeletingName(nameToDelete);
      setMessage({ type: "", text: "" });

      const response = await apiClient.delete(`/Documents/${encodeURIComponent(nameToDelete)}`);
      setMessage({ type: "success", text: response.data.message });
      await fetchDocuments();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to delete document."
      });
    } finally {
      setDeletingName(null);
      setDocumentToDelete(null); // Close modal
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-earth-maroon">PDF Knowledge Base Manager</h1>
          <p className="text-sm text-earth-maroon/70 mt-1">
            Upload or remove PDF manuals used by the AI RAG search engine.
          </p>
        </div>

        {/* Notifications */}
        {message.text && (
          <div
            className={`p-4 rounded-lg text-sm font-medium border ${
              message.type === "error"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-green-50 text-green-700 border-green-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Upload Form Card */}
        <div className="bg-white p-6 rounded-xl border border-earth-rust/20 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-earth-maroon">Upload New Document</h2>

          <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="flex-1 block w-full text-sm text-earth-maroon/80
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-earth-beige file:text-earth-maroon
                hover:file:bg-earth-rust/20
                cursor-pointer border border-earth-rust/30 rounded-lg p-1.5"
            />

            <button
              type="submit"
              disabled={!selectedFile || isUploading}
              className="bg-earth-green hover:bg-earth-rust text-earth-beige px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <span className="animate-spin">🌀</span> Processing...
                </>
              ) : (
                "Upload & Vectorize"
              )}
            </button>
          </form>
        </div>

        {/* Existing PDFs Table */}
        <div className="bg-white rounded-xl border border-earth-rust/20 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-earth-rust/20 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-earth-maroon">Indexed Documents</h2>
            <button
              onClick={fetchDocuments}
              className="text-xs font-semibold text-earth-rust hover:text-earth-maroon transition-colors"
            >
              Refresh List
            </button>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-earth-maroon/60 text-sm">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="p-8 text-center text-earth-maroon/60 text-sm">
              No PDF manuals indexed in the database yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-earth-maroon">
                <thead className="bg-earth-green/50 border-b border-earth-rust/20 text-xs font-bold uppercase tracking-wider text-earth-maroon/70">
                  <tr>
                    <th className="px-6 py-3">Document Name</th>
                    <th className="px-6 py-3">Vector Chunks</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-rust/10">
                  {documents.map((doc) => (
                    <tr key={doc.documentName} className="hover:bg-earth-beige/30 transition-colors">
                      <td className="px-6 py-4 font-medium flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                        </svg>
                        {doc.documentName}
                      </td>
                      <td className="px-6 py-4 text-earth-maroon/80">{doc.totalChunks} chunks</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setDocumentToDelete(doc.documentName)}
                          disabled={deletingName === doc.documentName}
                          className="text-red-600 hover:text-red-800 text-xs font-semibold px-3 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Custom Deletion Modal */}
      {documentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-earth-rust/20 space-y-4">
            {/* Modal Icon & Header */}
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 bg-red-100 rounded-full">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-earth-maroon">Delete Document?</h3>
            </div>

            {/* Modal Description */}
            <p className="text-sm text-earth-maroon/80 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-earth-maroon">"{documentToDelete}"</span>? This action will permanently remove all associated vector embeddings from the database.
            </p>

            {/* Modal Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDocumentToDelete(null)}
                disabled={deletingName !== null}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-earth-maroon hover:bg-earth-beige transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={executeDelete}
                disabled={deletingName !== null}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                {deletingName ? (
                  <>
                    <span className="animate-spin">🌀</span> Deleting...
                  </>
                ) : (
                  "Confirm Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}