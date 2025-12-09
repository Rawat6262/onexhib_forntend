// Frontend: CompanyEditPopup.jsx
// React component to fetch company by id and edit/update it.
// Props:
// - open (bool)
// - onClose (fn)
// - companyId (string)

import React, { useEffect, useState } from 'react';

export default function CompanyEditPopup({ open, onClose, companyId }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    company_name: '',
    company_email: '',
    company_nature: '',
    company_phone_number: '',
    company_address: '',
    pincode: '',
    about_company: '',
    company_url: '',
    createdBy: ''
  });

  useEffect(() => {
    if (!open || !companyId) return;

    setLoading(true);
    setError(null);

    fetch(`/api/companydetail/${companyId}`)
      .then(res => {
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setForm({
          company_name: data.company_name || '',
          company_email: data.company_email || '',
          company_nature: data.company_nature || '',
          company_phone_number: data.company_phone_number || '',
          company_address: data.company_address || '',
          pincode: data.pincode || '',
          about_company: data.about_company || '',
          company_url: data.company_url || '',
          createdBy: data.createdBy || ''
        });
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [open, companyId]);

  if (!open) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(s => ({ ...s, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/updatecompany/${companyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          company_phone_number: Number(form.company_phone_number),
          pincode: Number(form.pincode)
        })
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Save failed: ${res.status}`);
      }

      const updated = await res.json();
      console.log('Company updated:', updated);
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
          <h2 className="text-xl font-semibold">Edit Company</h2>
          <button onClick={onClose} className="px-3 py-1 rounded hover:bg-gray-100">✕</button>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600">Error: {error}</div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm">Company Name</label>
              <input name="company_name" value={form.company_name} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            </div>

            <div>
              <label className="block text-sm">Company Email</label>
              <input name="company_email" type="email" value={form.company_email} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            </div>

            <div>
              <label className="block text-sm">Nature</label>
              <input name="company_nature" value={form.company_nature} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            </div>

            <div>
              <label className="block text-sm">Phone Number</label>
              <input name="company_phone_number" type="tel" value={form.company_phone_number} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm">Address</label>
              <textarea name="company_address" value={form.company_address} onChange={handleChange} rows={3} className="mt-1 w-full border rounded px-2 py-1" />
            </div>

            <div>
              <label className="block text-sm">Pincode</label>
              <input name="pincode" type="number" value={form.pincode} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            </div>

            <div>
              <label className="block text-sm">Company URL</label>
              <input name="company_url" value={form.company_url} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm">About Company</label>
              <textarea name="about_company" value={form.about_company} onChange={handleChange} rows={4} className="mt-1 w-full border rounded px-2 py-1" />
            </div>

            <div className="col-span-2 flex justify-end gap-3 mt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white">{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
