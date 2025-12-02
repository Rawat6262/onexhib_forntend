import axios from "axios";
import React, { useState } from "react";
import { toast } from "sonner";

// --- 1. Refined Label Component (Bold & Visible) ---
const Label = ({ children, required, htmlFor }) => (
  <label htmlFor={htmlFor} className="block text-sm font-bold text-gray-900 mb-1.5 tracking-wide">
    {children} {required && <span className="text-red-600 text-base">*</span>}
  </label>
);

// --- 2. Reusable Input Components ---
const InputField = ({ id, label, value, onChange, placeholder, type = "text", required, onBlur, error }) => (
  <div className="w-full">
    <Label required={required} htmlFor={id}>{label}</Label>
    <input
      id={id}
      name={id}
      type={type}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      required={required}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      className={`w-full rounded-md border px-3 py-2 text-gray-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition shadow-sm placeholder-gray-400 ${
        error ? "border-red-500" : "border-gray-300 bg-white"
      }`}
    />
    {error && <p id={`${id}-error`} className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
);

const TextAreaField = ({ id, label, value, onChange, placeholder, rows = 3, required, onBlur, error }) => (
  <div className="w-full">
    <Label required={required} htmlFor={id}>{label}</Label>
    <textarea
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      rows={rows}
      required={required}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      className={`w-full rounded-md border px-3 py-2 text-gray-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition shadow-sm resize-none placeholder-gray-400 ${
        error ? "border-red-500" : "border-gray-300 bg-white"
      }`}
    />
    {error && <p id={`${id}-error`} className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
);

// SIMPLE File Input (Clean & Professional)
const SimpleFileField = ({ id, label, onChange, accept = "image/*", error }) => (
  <div className="w-full">
    <Label htmlFor={id}>{label}</Label>
    <input
      id={id}
      name={id}
      type="file"
      onChange={onChange}
      accept={accept}
      className={`block w-full text-sm text-gray-500
        file:mr-4 file:py-2 file:px-4
        file:rounded-md file:border-0
        file:text-sm file:font-bold
        file:bg-blue-50 file:text-blue-700
        hover:file:bg-blue-100
        cursor-pointer border ${error ? "border-red-500" : "border-gray-200"} rounded-md bg-white`}
    />
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
);

// ---------------- Validation helpers ----------------
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const URL_RE = /^(https?:\/\/)[^\s$.?#].[^\s]*$/i; // simple URL validator - expects protocol
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_LAYOUT_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const PopupForm = ({ onClose }) => {
  // --- State Variables ---
  const [exhibition_name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [venue, setVenue] = useState("");
  const [exhibition_address, setAddress] = useState("");
  const [email, setEmail] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [about_exhibition, setAbout] = useState("");
  const [speakers, setSpeakers] = useState("");
  const [session, setSession] = useState("");

  const [sponsor, setSponsor] = useState("");
  const [partners, setPartners] = useState("");
  const [Support, setSupport] = useState(""); // Support state

  const [privacy_policy, setPrivacy] = useState("");
  const [terms_of_service, setTerms] = useState("");

  const [exhibition_image, setImage] = useState(null);
  const [layout, setLayout] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // errors & touched for inline validation
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // helper: mark field touched
  const markTouched = (id) => setTouched((s) => ({ ...s, [id]: true }));

  // file change handlers with validation
  const handleImageChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) {
      setImage(null);
      setErrors((s) => ({ ...s, exhibition_image: null }));
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(f.type)) {
      setImage(null);
      setErrors((s) => ({ ...s, exhibition_image: "Image must be JPG/PNG/WEBP." }));
      toast.error("Unsupported image type. Allowed: JPG, PNG, WEBP.");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setImage(null);
      setErrors((s) => ({ ...s, exhibition_image: "Image exceeds 5MB." }));
      toast.error("Image too large. Max 5MB allowed.");
      return;
    }
    setImage(f);
    setErrors((s) => ({ ...s, exhibition_image: null }));
  };

  const handleLayoutChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) {
      setLayout(null);
      setErrors((s) => ({ ...s, layout: null }));
      return;
    }
    if (!ALLOWED_LAYOUT_TYPES.includes(f.type)) {
      setLayout(null);
      setErrors((s) => ({ ...s, layout: "Layout must be PDF or image (JPG/PNG/WEBP)." }));
      toast.error("Unsupported layout file type. Allowed: PDF, JPG, PNG, WEBP.");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setLayout(null);
      setErrors((s) => ({ ...s, layout: "Layout file exceeds 5MB." }));
      toast.error("Layout too large. Max 5MB allowed.");
      return;
    }
    setLayout(f);
    setErrors((s) => ({ ...s, layout: null }));
  };

  // full-form validation, returns errors object
  const validateAll = () => {
    const e = {};

    if (!exhibition_name.trim()) e.exhibition_name = "Exhibition name is required.";
    if (!category.trim()) e.category = "Category is required.";
    if (!venue.trim()) e.venue = "Venue is required.";
    if (!exhibition_address.trim()) e.exhibition_address = "Address is required.";

    if (!email.trim()) e.email = "Contact email is required.";
    else if (!EMAIL_RE.test(email.trim())) e.email = "Enter a valid email address.";

    // dates
    if (!startDate) e.startDate = "Start date is required.";
    if (!endDate) e.endDate = "End date is required.";
    if (startDate && endDate) {
      const s = new Date(startDate);
      const en = new Date(endDate);
      if (s > en) e.endDate = "End date must be same or after start date.";
    }

    if (!about_exhibition.trim()) e.about_exhibition = "Description is required.";

    // optional URLs, if present validate
    if (privacy_policy.trim() && !URL_RE.test(privacy_policy.trim())) e.privacy_policy = "Enter a valid URL (include http/https).";
    if (terms_of_service.trim() && !URL_RE.test(terms_of_service.trim())) e.terms_of_service = "Enter a valid URL (include http/https).";

    // file errors previously set in handlers; also ensure not oversized/invalid
    // merge any existing file errors
    if (errors.exhibition_image) e.exhibition_image = errors.exhibition_image;
    if (errors.layout) e.layout = errors.layout;

    return e;
  };

  // Submit Handler
  const handleExhibition = async (ev) => {
    ev.preventDefault();

    // let native browser run constraint validation first
    const formEl = document.getElementById("exhibition-form");
    if (formEl && !formEl.checkValidity()) {
      // show native UI
      formEl.reportValidity();
      return;
    }

    // run custom validation
    const validationErrors = validateAll();
    setErrors(validationErrors);
    // mark all touched so inline errors show
    setTouched({
      exhibition_name: true,
      category: true,
      venue: true,
      exhibition_address: true,
      email: true,
      startDate: true,
      endDate: true,
      about_exhibition: true,
      privacy_policy: true,
      terms_of_service: true,
    });

    if (Object.keys(validationErrors).length) {
      toast.error("Please fix the highlighted errors.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("exhibition_name", exhibition_name.trim());
      formData.append("category", category.trim());
      formData.append("venue", venue.trim());
      formData.append("exhibition_address", exhibition_address.trim());
      formData.append("email", email.trim());
      formData.append("starting_date", startDate);
      formData.append("ending_date", endDate);
      formData.append("about_exhibition", about_exhibition.trim());
      formData.append("speakers", speakers.trim());
      formData.append("session", session.trim());
      formData.append("sponsor", sponsor.trim());
      formData.append("partners", partners.trim());
      formData.append("Support", Support.trim());
      formData.append("privacy_policy", privacy_policy.trim());
      formData.append("terms_of_service", terms_of_service.trim());

      if (exhibition_image) formData.append("exhibition_image", exhibition_image);
      if (layout) formData.append("layout", layout);

      await axios.post("/api/exhibition", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Exhibition saved successfully!");
      onClose?.();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save exhibition.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
      {/* 90% Width and Height Container */}
      <div className="bg-white w-[90%] h-[90%] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">

        {/* Header */}
        <div className="flex justify-between items-center px-8 py-5 border-b bg-gray-50 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Add New Exhibition</h2>
            <p className="text-sm text-gray-500 font-medium">Please fill in the details below</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-600 text-4xl leading-none transition-colors"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50/30">
          <form id="exhibition-form" onSubmit={handleExhibition} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6" noValidate>

            {/* === Left Column === */}
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-blue-700 font-bold uppercase text-xs tracking-wider mb-2">Basic Information</h3>
                <InputField
                  id="exhibition_name"
                  label="Exhibition Name"
                  value={exhibition_name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Global Tech Summit"
                  required
                  onBlur={() => markTouched("exhibition_name")}
                  error={touched.exhibition_name ? errors.exhibition_name : null}
                />

                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    id="category"
                    label="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Technology"
                    required
                    onBlur={() => markTouched("category")}
                    error={touched.category ? errors.category : null}
                  />
                  <InputField
                    id="email"
                    type="email"
                    label="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@domain.com"
                    required
                    onBlur={() => markTouched("email")}
                    error={touched.email ? errors.email : null}
                  />
                </div>
              </div>

              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-blue-700 font-bold uppercase text-xs tracking-wider mb-2">Location</h3>
                <InputField
                  id="venue"
                  label="Venue Name"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Grand Convention Center"
                  required
                  onBlur={() => markTouched("venue")}
                  error={touched.venue ? errors.venue : null}
                />

                <TextAreaField
                  id="exhibition_address"
                  label="Full Address"
                  value={exhibition_address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  placeholder="Street, City, Zip Code"
                  required
                  onBlur={() => markTouched("exhibition_address")}
                  error={touched.exhibition_address ? errors.exhibition_address : null}
                />
              </div>

              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-blue-700 font-bold uppercase text-xs tracking-wider mb-2">Schedule Details</h3>
                <TextAreaField
                  id="speakers"
                  label="Speakers"
                  value={speakers}
                  onChange={(e) => setSpeakers(e.target.value)}
                  rows={3}
                  placeholder="List key speakers..."
                />

                <TextAreaField
                  id="session"
                  label="Session Agenda"
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  rows={3}
                  placeholder="Brief schedule of events..."
                />
              </div>
            </div>

            {/* === Right Column === */}
            <div className="space-y-6">

              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-blue-700 font-bold uppercase text-xs tracking-wider mb-2">Dates & Media</h3>
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    id="startDate"
                    type="date"
                    label="Start Date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    onBlur={() => markTouched("startDate")}
                    error={touched.startDate ? errors.startDate : null}
                  />
                  <InputField
                    id="endDate"
                    type="date"
                    label="End Date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    onBlur={() => markTouched("endDate")}
                    error={touched.endDate ? errors.endDate : null}
                  />
                </div>

                <div className="space-y-4 pt-2">
                  <SimpleFileField
                    id="exhibition_image"
                    label="Cover Image"
                    onChange={handleImageChange}
                    accept="image/*"
                    error={touched.exhibition_image ? errors.exhibition_image : errors.exhibition_image}
                  />
                  <SimpleFileField
                    id="layout"
                    label="Layout File (PDF/Image)"
                    accept=".pdf,image/*"
                    onChange={handleLayoutChange}
                    error={touched.layout ? errors.layout : errors.layout}
                  />
                </div>
              </div>

              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-blue-700 font-bold uppercase text-xs tracking-wider mb-2">Additional Info</h3>
                <TextAreaField
                  id="about_exhibition"
                  label="About Exhibition"
                  value={about_exhibition}
                  onChange={(e) => setAbout(e.target.value)}
                  rows={3}
                  placeholder="Description..."
                  required
                  onBlur={() => markTouched("about_exhibition")}
                  error={touched.about_exhibition ? errors.about_exhibition : null}
                />

                <div className="grid grid-cols-2 gap-4">
                  <TextAreaField
                    id="sponsor"
                    label="Sponsors"
                    value={sponsor}
                    onChange={(e) => setSponsor(e.target.value)}
                    rows={2}
                  />
                  <TextAreaField
                    id="partners"
                    label="Partners"
                    value={partners}
                    onChange={(e) => setPartners(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>

              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-blue-700 font-bold uppercase text-xs tracking-wider mb-2">Contact & Legal</h3>
                <InputField
                  id="Support"
                  label="Support Contact"
                  value={Support}
                  onChange={(e) => setSupport(e.target.value)}
                  placeholder="Phone or Helpdesk Email"
                />

                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    id="privacy_policy"
                    label="Privacy Policy URL"
                    value={privacy_policy}
                    onChange={(e) => setPrivacy(e.target.value)}
                    placeholder="https://..."
                    onBlur={() => markTouched("privacy_policy")}
                    error={touched.privacy_policy ? errors.privacy_policy : null}
                  />
                  <InputField
                    id="terms_of_service"
                    label="Terms URL"
                    value={terms_of_service}
                    onChange={(e) => setTerms(e.target.value)}
                    placeholder="https://..."
                    onBlur={() => markTouched("terms_of_service")}
                    error={touched.terms_of_service ? errors.terms_of_service : null}
                  />
                </div>
              </div>
            </div>

            {/* Footer (inside form so native validation + custom validation run) */}
            <div className="col-span-full p-5 border-t bg-gray-50 flex justify-end gap-4 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition shadow-md disabled:opacity-70"
              >
                {isSubmitting ? "Saving..." : "Save Exhibition"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PopupForm;
