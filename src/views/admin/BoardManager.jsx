"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { invalidate } from "../../lib/queries";
import ImageUploader from "../../components/ImageUploader";

const empty = { name: "", role: "", photo_url: "", bio: "" };

export default function BoardManager() {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(empty);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("board_members").select("*").order("sort_order");
    setMembers(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    await supabase.from("board_members").insert([{ ...form, sort_order: members.length }]);
    invalidate("board");
    setForm(empty);
    load();
  }

  function startEdit(m) {
    setEditingId(m.id);
    setEditForm({ name: m.name, role: m.role ?? "", photo_url: m.photo_url ?? "", bio: m.bio ?? "" });
  }

  async function saveEdit(id) {
    await supabase.from("board_members").update(editForm).eq("id", id);
    invalidate("board");
    setEditingId(null);
    load();
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete "${name}"?`)) return;
    await supabase.from("board_members").delete().eq("id", id);
    invalidate("board");
    load();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-semibold text-ink">Board of Directors</h1>

      <form onSubmit={handleAdd} className="mt-8 space-y-3">
        <div className="flex gap-3">
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Name" className="input" />
          <input value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} placeholder="Role, e.g. CEO" className="input" />
        </div>
        <ImageUploader
          label="Photo"
          value={form.photo_url}
          onChange={(url) => setForm((f) => ({ ...f, photo_url: url }))}
        />
        <textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} placeholder="Short bio (optional)" rows={2} className="input" />
        <button type="submit" className="bg-ink px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-paper hover:bg-steel">
          + Add member
        </button>
      </form>

      <div className="mt-10 divide-y divide-ink/10 border-t border-ink/10">
        {loading && <p className="py-6 font-mono text-sm text-ink/50">Loading…</p>}
        {members.map((m) => (
          <div key={m.id} className="py-4">
            {editingId === m.id ? (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} className="input" />
                  <input value={editForm.role} onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))} className="input" />
                </div>
                <ImageUploader
                  label="Photo"
                  value={editForm.photo_url}
                  onChange={(url) => setEditForm((f) => ({ ...f, photo_url: url }))}
                />
                <textarea value={editForm.bio} onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))} rows={2} className="input" />
                <div className="flex gap-4 font-mono text-xs uppercase tracking-widest">
                  <button onClick={() => saveEdit(m.id)} className="text-steel hover:text-ink">Save</button>
                  <button onClick={() => setEditingId(null)} className="text-ink/50 hover:text-ink">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {m.photo_url && <img src={m.photo_url} alt="" className="h-12 w-12 object-cover" />}
                  <div>
                    <p className="font-body font-medium text-ink">{m.name}</p>
                    <p className="font-mono text-xs text-ink/50">{m.role}</p>
                  </div>
                </div>
                <div className="flex gap-4 font-mono text-xs uppercase tracking-widest">
                  <button onClick={() => startEdit(m)} className="text-steel hover:text-ink">Edit</button>
                  <button onClick={() => handleDelete(m.id, m.name)} className="text-red-500 hover:text-red-700">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
