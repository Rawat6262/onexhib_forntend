// Frontend: ExhibitionEditPopup.jsx
// React component that fetches exhibition data by id and allows updating it.
// Props:
// - open (bool)
// - onClose (fn)
// - exhibitionId (string)  <-- id to fetch

import React, { useEffect, useState } from "react";

export default function ExhibitionEditPopup({ open, onClose, exhibitionId }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    exhibition_name: "",
    addedBy: "",
    exhibition_address: "",
    category: "",
    venue: "",
    starting_date: "",
    ending_date: "",
    email: "",
    exhibtion_url: "",
    about_exhibition: "",
    layout_url: "",
    speakers: "",
    session: "",
    sponsor: "",
    privacy_policy: "",
    partners: "",
    terms_of_service: "",
    Support: "",
  });

  useEffect(() => {
    if (!open || !exhibitionId) return;

    setLoading(true);
    setError(null);

    // Fetch exhibition by id
    fetch(`/api/find/exhibition/${exhibitionId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // map server fields to form fields
        setForm({
          exhibition_name: data.exhibition_name || "",
          addedBy: data.addedBy || "",
          exhibition_address: data.exhibition_address || "",
          category: data.category || "",
          venue: data.venue || "",
          starting_date: data.starting_date ? data.starting_date.slice(0, 10) : "",
          ending_date: data.ending_date ? data.ending_date.slice(0, 10) : "",
          email: data.email || "",
          exhibtion_url: data.exhibtion_url || "",
          about_exhibition: data.about_exhibition || "",
          layout_url: data.layout_url || "",
          speakers: data.speakers || "",
          session: data.session || "",
          sponsor: data.sponsor || "",
          privacy_policy: data.privacy_policy || "",
          partners: data.partners || "",
          terms_of_service: data.terms_of_service || "",
          Support: data.Support || "",
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [open, exhibitionId]);

  if (!open) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/updateexhibitions/${exhibitionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Save failed: ${res.status}`);
      }

      const updated = await res.json();
      console.log("Saved:", updated);
      onClose && onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white w-[80vw] h-[90vh] rounded-2xl shadow-2xl p-6 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Edit Exhibition</h2>
          <button onClick={onClose} className="px-3 py-1 rounded hover:bg-gray-100">✕</button>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600">Error: {error}</div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm">Exhibition Name</label>
              <input name="exhibition_name" value={form.exhibition_name} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            </div>

            <div>
              <label className="block text-sm ">Added By</label>
              <input name="addedBy" value={form.addedBy} onChange={handleChange} disabled className="mt-1 w-full border rounded px-2 py-1 opacity-20" />
            </div>

            <div>
              <label className="block text-sm">Exhibition Address</label>
              <input name="exhibition_address" value={form.exhibition_address} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            </div>

            <div>
              <label className="block text-sm">Category</label>
              <input name="category" value={form.category} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            </div>

            <div>
              <label className="block text-sm">Venue</label>
              <input name="venue" value={form.venue} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            </div>

            <div>
              <label className="block text-sm">Starting Date</label>
              <input name="starting_date" type="date" value={form.starting_date} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            </div>

            <div>
              <label className="block text-sm">Ending Date</label>
              <input name="ending_date" type="date" value={form.ending_date} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            </div>

            <div>
              <label className="block text-sm">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            </div>

            <div>
              <label className="block text-sm">Exhibition URL</label>
              <input name="exhibtion_url" value={form.exhibtion_url} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm">About Exhibition</label>
              <textarea name="about_exhibition" value={form.about_exhibition} onChange={handleChange} rows={4} className="mt-1 w-full border rounded px-2 py-1" />
            </div>

            <div>
              <label className="block text-sm">Layout URL</label>
              <input name="layout_url" value={form.layout_url} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            </div>

            <div>
              <label className="block text-sm">Speakers</label>
              <input name="speakers" value={form.speakers} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            </div>

            <div>
              <label className="block text-sm">Session</label>
              <input name="session" value={form.session} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            </div>

            <div>
              <label className="block text-sm">Sponsor</label>
              <input name="sponsor" value={form.sponsor} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            </div>

            <div>
              <label className="block text-sm">Privacy Policy</label>
              <input name="privacy_policy" value={form.privacy_policy} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            </div>

            <div>
              <label className="block text-sm">Partners</label>
              <input name="partners" value={form.partners} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            </div>

            <div>
              <label className="block text-sm">Terms of Service</label>
              <input name="terms_of_service" value={form.terms_of_service} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            </div>

            <div>
              <label className="block text-sm">Support</label>
              <input name="Support" value={form.Support} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            </div>

            <div className="col-span-2 flex justify-end gap-3 mt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}


