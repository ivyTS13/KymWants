import React, { useState, useEffect } from "react";
import apiClient from "../api/axios";
import Layout from "../components/KymLayout";
import { DocumentIcon, TrashIcon, RefreshIcon, SpinnerIcon, PlusIcon } from "../components/icons/UiIcons";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

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
      setDocumentToDelete(null);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-earth-maroon tracking-tight font-display">PDF Knowledge Base</h1>
          <p className="text-sm text-earth-maroon/70 mt-1">
            Manage culinary manuals and food guides indexed by the AI dining search engine.
          </p>
        </div>

        {/* Notifications */}
        {message.text && (
          <div
            role={message.type === "error" ? "alert" : "status"}
            className={`p-4 rounded-2xl text-xs font-semibold border transition-all ${
              message.type === "error"
                ? "bg-red-50/90 text-red-700 border-red-200/70"
                : "bg-earth-green/10 text-earth-green border-earth-green/20"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Upload Form Card */}
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-earth-rust/15 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-earth-rust/10 flex items-center justify-center text-earth-rust">
              <PlusIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-earth-maroon">Upload Menu or Guide</h2>
              <p className="text-xs text-earth-maroon/60">Attach a PDF to vectorize and store in knowledge base.</p>
            </div>
          </div>

          <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center pt-2">
            <input
              type="file"
              accept=".pdf"
              aria-label="Select PDF file"
              onChange={handleFileChange}
              className="flex-1 block w-full text-xs text-earth-maroon/80
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-xs file:font-bold
                file:bg-earth-beige file:text-earth-maroon
                hover:file:bg-earth-rust/15
                cursor-pointer border border-earth-rust/20 rounded-2xl p-2 bg-white/60"
            />

            <button
              type="submit"
              disabled={!selectedFile || isUploading}
              className="bg-earth-rust hover:bg-earth-maroon text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs hover:scale-[1.01] active:scale-[0.99]"
            >
              {isUploading ? (
                <>
                  <SpinnerIcon className="w-4 h-4 animate-spin" /> Processing...
                </>
              ) : (
                "Upload & Index"
              )}
            </button>
          </form>
        </div>

        {/* Existing PDFs Table */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-earth-rust/15 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-earth-rust/10 bg-earth-beige/30 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <DocumentIcon className="w-4 h-4 text-earth-rust" />
              <h2 className="text-sm font-bold text-earth-maroon">Indexed Documents</h2>
            </div>
            <button
              onClick={fetchDocuments}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-earth-rust hover:text-earth-maroon transition-colors"
            >
              <RefreshIcon className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-earth-maroon/60 text-xs flex flex-col items-center justify-center gap-2">
              <SpinnerIcon className="w-6 h-6 text-earth-rust animate-spin" />
              Loading documents...
            </div>
          ) : documents.length === 0 ? (
            <div className="p-12 text-center text-earth-maroon/60 text-xs">
              No PDF manuals indexed yet. Upload one above!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-earth-maroon">
                <thead className="bg-earth-beige/50 border-b border-earth-rust/10 text-2xs font-bold uppercase tracking-wider text-earth-maroon/70">
                  <tr>
                    <th className="px-6 py-3.5">Document Name</th>
                    <th className="px-6 py-3.5">Vector Chunks</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-rust/10">
                  {documents.map((doc) => (
                    <tr key={doc.documentName} className="hover:bg-earth-beige/30 transition-colors">
                      <td className="px-6 py-4 font-semibold flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-earth-rust/10 flex items-center justify-center text-earth-rust shrink-0">
                          <DocumentIcon className="w-4 h-4" />
                        </div>
                        <span className="truncate max-w-sm">{doc.documentName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-earth-beige text-earth-maroon font-bold text-2xs">
                          {doc.totalChunks} chunks
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setDocumentToDelete(doc.documentName)}
                          disabled={deletingName === doc.documentName}
                          className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-xs font-bold px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100/80 transition-all disabled:opacity-50"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
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

      {/* Deletion Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(documentToDelete)}
        itemToDelete={documentToDelete}
        title="Remove Document?"
        description={
          <>
            Are you sure you want to delete{" "}
            <span className="font-bold text-earth-maroon">
              "{documentToDelete}"
            </span>
            ? This will permanently remove all associated vector embeddings from
            the dining AI.
          </>
        }
        isDeletingDishLoading={deletingName !== null}
        onCancel={() => setDocumentToDelete(null)}
        onConfirm={executeDelete}
      />
    </Layout>
  );
}
