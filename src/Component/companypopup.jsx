import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import PropTypes from "prop-types";

/* -------------------- UI HELPERS -------------------- */

const Label = ({ children, required }) => (
  <label className="block text-sm font-bold text-gray-900 mb-1">
    {children}
    {required && <span className="text-red-600 ml-1">*</span>}
  </label>
);

const InputField = ({
  label,
  value,
  onChange,
  type = "text",
  required,
  maxLength,
  placeholder,
}) => (
  <div>
    <Label required={required}>{label}</Label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      required={required}
      placeholder={placeholder}
      className="w-full rounded-md border border-gray-300 px-4 py-2.5 focus:ring-1 focus:ring-indigo-600 outline-none"
    />
  </div>
);

/* -------------------- CONSTANTS -------------------- */

const ALLOWED_BROCHURE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"];
const MAX_BROCHURE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGE_SIZE = 3 * 1024 * 1024;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const websiteRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}/i;

/* -------------------- MAIN COMPONENT -------------------- */

const PopupForms = ({ Close, data, onCompanyAdded }) => {
  const [form, setForm] = useState({
    company_name: "",
    company_email: "",
    company_nature: "",
    company_phone_number: "",
    company_address: "",
    pincode: "",
    about_company: "",
    company_website: "",
    stall_no: "",
    hall_no: "",
  });

  const [brochure, setBrochure] = useState(null); // 👉 company_url
  const [companyImage, setCompanyImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [createdBy, setCreatedBy] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (data) setCreatedBy(data?._id || data);
  }, [data]);

  const updateField = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  /* -------------------- FILE HANDLERS -------------------- */

  const handleBrochureChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_BROCHURE_TYPES.includes(file.type))
      return toast.error("Unsupported brochure file type");

    if (file.size > MAX_BROCHURE_SIZE)
      return toast.error("Brochure size must be under 5MB");

    setBrochure(file);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type))
      return toast.error("Only JPG or PNG allowed");

    if (file.size > MAX_IMAGE_SIZE)
      return toast.error("Image size must be under 3MB");

    setCompanyImage(file);
    setPreview(URL.createObjectURL(file));
  };

  /* -------------------- VALIDATION -------------------- */

  const validate = () => {
    if (!form.company_name.trim()) return "Company name is required";
    if (!emailRegex.test(form.company_email)) return "Invalid email";
    if (!form.company_nature.trim()) return "Nature of business is required";
    if (form.company_phone_number.length !== 10)
      return "Phone number must be 10 digits";
    if (form.pincode.length !== 6) return "Pincode must be 6 digits";
    if (!form.company_address.trim()) return "Address is required";
    if (!form.about_company.trim()) return "About company is required";
    if (!websiteRegex.test(form.company_website))
      return "Enter a valid website URL";
    if (!form.stall_no.trim()) return "Stall number is required";
    if (!form.hall_no.trim()) return "Hall number is required";
    if (!createdBy) return "CreatedBy missing";
    return null;
  };

  /* -------------------- SUBMIT -------------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const error = validate();
    if (error) return toast.error(error);

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) =>
        formData.append(key, value.trim())
      );

      formData.append("createdBy", createdBy);

      if (brochure) formData.append("brochure", brochure); // ✅ FIX
      if (companyImage)
        formData.append("company_image_url", companyImage);

      await axios.post("/api/company", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("✅ Company added successfully");
      onCompanyAdded?.();
      Close();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add company");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* -------------------- UI -------------------- */

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white w-[90%] h-[90%] max-w-6xl rounded-xl flex flex-col overflow-hidden">

        <div className="px-8 py-5 border-b flex justify-between shrink-0">
          <h2 className="text-xl font-bold">Add New Company</h2>
          <button onClick={Close} className="text-3xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Company Name" required value={form.company_name} onChange={updateField("company_name")} />
            <InputField label="Nature of Business" required value={form.company_nature} onChange={updateField("company_nature")} />
            <InputField label="Email" required type="email" value={form.company_email} onChange={updateField("company_email")} />
            <InputField label="Phone Number" required maxLength={10}
              value={form.company_phone_number}
              onChange={(e) =>
                updateField("company_phone_number")({
                  target: { value: e.target.value.replace(/\D/g, "") },
                })
              }
            />
            <InputField label="Address" required value={form.company_address} onChange={updateField("company_address")} />
            <InputField label="Pincode" required maxLength={6}
              value={form.pincode}
              onChange={(e) =>
                updateField("pincode")({
                  target: { value: e.target.value.replace(/\D/g, "") },
                })
              }
            />
            <InputField label="Company Website" required value={form.company_website} onChange={updateField("company_website")} />
            <InputField label="Stall No" required value={form.stall_no} onChange={updateField("stall_no")} />
            <InputField label="Hall No" required value={form.hall_no} onChange={updateField("hall_no")} />
          </div>

          <div>
            <Label required>About Company</Label>
            <textarea
              className="w-full h-32 border rounded-md p-3"
              value={form.about_company}
              onChange={updateField("about_company")}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Company Brochure (PDF / DOC)</Label>
              <input type="file" onChange={handleBrochureChange} />
            </div>

            <div>
              <Label>Company Image</Label>
              {preview && (
                <img src={preview} alt="preview" className="h-32 rounded mb-2 object-cover" />
              )}
              <input type="file" onChange={handleImageChange} />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <button type="button" onClick={Close} className="px-6 py-2 border rounded-md">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2 rounded-md bg-indigo-600 text-white font-semibold"
            >
              {isSubmitting ? "Saving..." : "Save Company"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

PopupForms.propTypes = {
  Close: PropTypes.func.isRequired,
  data: PropTypes.any,
  onCompanyAdded: PropTypes.func,
};

export default PopupForms;
