import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import PropTypes from "prop-types";

// --- Custom "Bold & Visible" Label ---
const Label = ({ children, required, htmlFor }) => (
  <label htmlFor={htmlFor} className="block text-sm font-bold text-gray-900 mb-1.5 tracking-wide">
    {children} {required && <span className="text-red-600 text-lg align-middle ml-1">*</span>}
  </label>
);

// --- Reusable Input Component ---
const InputField = ({ id, label, value, onChange, placeholder, type = "text", required, maxLength, onBlur }) => (
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
      maxLength={maxLength}
      required={required}
      className="w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-gray-900 font-medium focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition shadow-sm placeholder-gray-400"
    />
  </div>
);

InputField.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  required: PropTypes.bool,
  maxLength: PropTypes.number,
  onBlur: PropTypes.func,
};

const ALLOWED_BROCHURE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];
const MAX_BROCHURE_SIZE = 5 * 1024 * 1024; // 5MB
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PopupForms = ({ Close, data, onCompanyAdded }) => {
  // --- State ---
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyNature, setCompanyNature] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [pincode, setPincode] = useState("");
  const [companyPhoneNumber, setCompanyPhoneNumber] = useState("");
  const [aboutCompany, setAboutCompany] = useState("");
  const [brochureFile, setBrochureFile] = useState(null);
  const [createdBy, setBy] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (data) setBy(data);
  }, [data]);

  // --- Basic client-side validation function ---
  const validate = () => {
    if (!companyName.trim()) return "Company name is required.";
    if (!companyNature.trim()) return "Nature of business is required.";
    if (!companyEmail.trim()) return "Email is required.";
    if (!emailRegex.test(companyEmail.trim())) return "Enter a valid email address.";
    if (!companyPhoneNumber.trim()) return "Phone number is required.";
    if (companyPhoneNumber.trim().length !== 10) return "Phone number must be 10 digits.";
    if (!companyAddress.trim()) return "Company address is required.";
    if (!pincode.trim()) return "Pincode is required.";
    if (pincode.trim().length !== 6) return "Pincode must be 6 digits.";
    if (!aboutCompany.trim()) return "About company is required.";

    if (brochureFile) {
      if (!ALLOWED_BROCHURE_TYPES.includes(brochureFile.type)) return "Unsupported brochure file type.";
      if (brochureFile.size > MAX_BROCHURE_SIZE) return "Brochure file size must be <= 5MB.";
    }

    return null; // no error
  };

  const handleBrochureChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setBrochureFile(null);
      return;
    }
    if (!ALLOWED_BROCHURE_TYPES.includes(file.type)) {
      toast.error("Unsupported file type. Allowed: PDF, DOC, DOCX, JPG, PNG.");
      setBrochureFile(null);
      return;
    }
    if (file.size > MAX_BROCHURE_SIZE) {
      toast.error("File too large. Max 5MB allowed.");
      setBrochureFile(null);
      return;
    }
    setBrochureFile(file);
  };

  // --- Submit Logic ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // First allow browser to run native constraint validation
    const formEl = document.getElementById("companyForm");
    if (formEl && !formEl.checkValidity()) {
      formEl.reportValidity();
      return;
    }

    const customError = validate();
    if (customError) {
      toast.error(customError);
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("company_name", companyName.trim());
      formData.append("company_address", companyAddress);
      formData.append("company_nature", companyNature.trim());
      formData.append("company_email", companyEmail.trim());
      formData.append("pincode", pincode.trim());
      formData.append("company_phone_number", companyPhoneNumber.trim());
      formData.append("about_company", aboutCompany.trim());
      formData.append("createdBy", createdBy.trim());

      if (brochureFile) {
        formData.append("brochure", brochureFile);
      }

      await axios.post("/api/company", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("✅ Company added successfully!");
      if (onCompanyAdded) onCompanyAdded();
      // reset form (simple reset)
      setCompanyName("");
      setCompanyAddress("");
      setCompanyNature("");
      setCompanyEmail("");
      setPincode("");
      setCompanyPhoneNumber("");
      setAboutCompany("");
      setBrochureFile(null);
      Close();
    } catch (err) {
      console.error(err);
      toast.error("❌ Error adding company");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Main Card: Fixed Height & Width Constraints */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">

        {/* Header */}
        <div className="flex justify-between items-center bg-gray-50 px-8 py-5 border-b border-gray-200 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Add New Company</h2>
            <p className="text-sm text-gray-500 font-semibold mt-1">Organization Details</p>
          </div>
          <button
            onClick={Close}
            className="text-gray-400 hover:text-red-600 text-4xl leading-none transition-colors"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto bg-white">
          <form id="companyForm" onSubmit={handleSubmit} className="p-8" noValidate>

            <div className="flex flex-col lg:flex-row gap-10">

              {/* --- LEFT COLUMN (70%): Input Fields --- */}
              <div className="flex-1 space-y-6">

                {/* Row 1: Name & Nature */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    id="companyName"
                    label="Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Industries"
                    required
                  />
                  <InputField
                    id="companyNature"
                    label="Nature of Business"
                    value={companyNature}
                    onChange={(e) => setCompanyNature(e.target.value)}
                    placeholder="e.g. Manufacturing, IT"
                    required
                  />
                </div>

                {/* Row 2: Contact Info */}
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    id="companyEmail"
                    type="email"
                    label="Email Address"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    placeholder="contact@company.com"
                    required
                  />
                  <InputField
                    id="companyPhoneNumber"
                    label="Phone Number"
                    value={companyPhoneNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (val.length <= 10) setCompanyPhoneNumber(val);
                    }}
                    placeholder="9876543210"
                    maxLength={10}
                    required
                  />
                </div>

                {/* Row 3: Address (Full Width) & Pincode */}
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-[3]">
                    <InputField
                      id="companyAddress"
                      label="Company Address"
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      placeholder="Street address, City, State"
                      required
                    />
                  </div>
                  <div className="flex-[1]">
                    <InputField
                      id="pincode"
                      label="Pincode"
                      value={pincode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        if (val.length <= 6) setPincode(val);
                      }}
                      placeholder="000000"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* --- RIGHT COLUMN (30%): Large Text Area & File --- */}
              <div className="lg:w-[320px] flex flex-col gap-6 shrink-0">

                {/* About Section - Takes remaining height visually */}
                <div className="flex-1 flex flex-col">
                  <Label required htmlFor="aboutCompany">About Company</Label>
                  <textarea
                    id="aboutCompany"
                    name="aboutCompany"
                    value={aboutCompany}
                    onChange={(e) => setAboutCompany(e.target.value)}
                    placeholder="Write a brief description about the company..."
                    className="w-full flex-1 min-h-[160px] rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-900 font-medium focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition shadow-sm resize-none placeholder-gray-400"
                    required
                  />
                </div>

                {/* File Upload - Clean Box Style */}
                <div className="bg-indigo-50 rounded-lg p-5 border border-indigo-100">
                  <Label htmlFor="brochure">Company Brochure</Label>
                  <input
                    id="brochure"
                    name="brochure"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleBrochureChange}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-white file:text-indigo-700 hover:file:bg-indigo-50 cursor-pointer mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-2">Supported: PDF, DOC, DOCX, JPG, PNG — max 5MB</p>
                </div>

              </div>
            </div>

            {/* Footer (moved inside form so native validation runs) */}
            <div className="p-5 border-t border-gray-200 bg-gray-50 flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={Close}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition shadow-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-2.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition shadow-md disabled:opacity-70 flex items-center gap-2"
              >
                {isSubmitting ? "Saving..." : "Save Company"}
              </button>
            </div>

          </form>
        </div>

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
