import React, { useState, useEffect } from "react";
import { getAssetCategories, createAssetCategory, updateAssetCategory } from "../api";

const FIELD_TYPES = ["String", "Number", "Boolean", "Date"];

export default function CatTab() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");
  const [fields, setFields] = useState([{ key: "", type: "String", required: false }]);

  const load = () => {
    setLoading(true);
    getAssetCategories().then(r => setCats(r.data || [])).catch(() => setError("Failed to load categories.")).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const addField = () => setFields([...fields, { key: "", type: "String", required: false }]);
  const removeField = (i) => setFields(fields.filter((_, idx) => idx !== i));
  const updateField = (i, key, val) => setFields(fields.map((f, idx) => idx === i ? { ...f, [key]: val } : f));

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setName("");
    setDescription("");
    setStatus("Active");
    setFields([{ key: "", type: "String", required: false }]);
  };

  const openEdit = (category) => {
    setEditId(category._id);
    setName(category.name || "");
    setDescription(category.description || "");
    setStatus(category.status || "Active");
    setFields((category.customFields || []).length ? category.customFields : [{ key: "", type: "String", required: false }]);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { name, description, status, customFields: fields.filter(f => f.key.trim()) };
      if (editId) {
        await updateAssetCategory(editId, payload);
      } else {
        await createAssetCategory(payload);
      }
      resetForm(); load();
    } catch (err) { setError(err.response?.data?.error || "Save failed."); }
  };

  const inp = "p-2 border border-zinc-200 rounded bg-white text-xs";

  if (loading) return <div className="text-xs text-zinc-500 p-4">Loading...</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded text-xs flex justify-between">{error}<button onClick={() => setError("")} className="font-bold">×</button></div>}
      <div className="flex justify-end">
        <button onClick={() => (showForm ? resetForm() : setShowForm(true))} className="px-3 py-1.5 bg-zinc-900 text-white rounded text-xs font-medium hover:bg-zinc-700">
          {showForm ? "Cancel" : "+ Add Category"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-zinc-50 border border-zinc-200 rounded p-4 space-y-3">
          <input required placeholder="Category name" className={`w-full ${inp}`} value={name} onChange={e => setName(e.target.value)} />
          <input placeholder="Short description" className={`w-full ${inp}`} value={description} onChange={e => setDescription(e.target.value)} />
          <select className={`w-full ${inp}`} value={status} onChange={e => setStatus(e.target.value)}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <div className="space-y-2">
            <div className="text-[10px] text-zinc-500 uppercase font-semibold">Custom Fields</div>
            {fields.map((f, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input placeholder="Field key" className={`flex-1 ${inp}`} value={f.key} onChange={e => updateField(i, "key", e.target.value)} />
                <select className={inp} value={f.type} onChange={e => updateField(i, "type", e.target.value)}>
                  {FIELD_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
                <label className="flex items-center gap-1 text-xs text-zinc-600 whitespace-nowrap">
                  <input type="checkbox" checked={f.required} onChange={e => updateField(i, "required", e.target.checked)} /> Required
                </label>
                <button type="button" onClick={() => removeField(i)} className="text-red-500 px-1 hover:text-red-700 font-bold">×</button>
              </div>
            ))}
            <button type="button" onClick={addField} className="text-xs text-blue-600 hover:underline">+ Add field</button>
          </div>
          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 text-xs">Create Category</button>
        </form>
      )}

      {cats.length === 0 ? (
        <div className="p-4 text-xs text-zinc-400 bg-white border border-zinc-200 rounded">No categories yet.</div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] uppercase text-zinc-500 font-semibold">
              <tr><th className="px-4 py-2.5 text-left">Name</th><th className="px-4 py-2.5 text-left">Custom Fields</th><th className="px-4 py-2.5 text-left">Status</th><th className="px-4 py-2.5 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {cats.map(c => (
                <tr key={c._id} className="hover:bg-zinc-50">
                  <td className="px-4 py-2.5 font-medium text-zinc-900">{c.name}</td>
                  <td className="px-4 py-2.5 text-zinc-600">{c.customFields?.length || 0} fields</td>
                  <td className="px-4 py-2.5 text-zinc-600">{c.status}</td>
                  <td className="px-4 py-2.5 text-right"><button onClick={() => openEdit(c)} className="px-2 py-1 border border-zinc-200 rounded hover:bg-zinc-100">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
