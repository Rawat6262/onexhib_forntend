import React, { useState, useMemo } from 'react';
import { Country, State, City } from 'country-state-city';
import Select from 'react-select';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import logo from '../assets/Dark.png';

function UserFormPopup({ onClose }) {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    company_name: '',
    designation: '',
    website: '',
    mobile_number: '',
    country: '',
    state: '',
    city: '',
    address: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // Country / State / City lists
  const countries = useMemo(
    () =>
      Country.getAllCountries().map((c) => ({
        value: c.isoCode,
        label: c.name,
      })),
    []
  );

  const states = useMemo(
    () =>
      form.country
        ? State.getStatesOfCountry(form.country).map((s) => ({
            value: s.isoCode,
            label: s.name,
          }))
        : [],
    [form.country]
  );

  const cities = useMemo(
    () =>
      form.country && form.state
        ? City.getCitiesOfState(form.country, form.state).map((c) => ({
            value: c.name,
            label: c.name,
          }))
        : [],
    [form.country, form.state]
  );

  // helper: mark touched
  const markTouched = (field) => setTouched((p) => ({ ...p, [field]: true }));

  // Handle dropdowns
  const handleSelect = (option, field) => {
    setForm((prev) => ({
      ...prev,
      [field]: option ? option.value : '',
      ...(field === 'country' ? { state: '', city: '' } : {}),
      ...(field === 'state' ? { city: '' } : {}),
    }));
    // mark touched for select fields
    markTouched(field);
    if (field === 'country') markTouched('state');
    if (field === 'state') markTouched('city');
  };

  // Handle inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'mobile_number') {
      // Allow only 10 digits
      const digits = value.replace(/\D/g, '').slice(0, 10);

      setForm((prev) => ({
        ...prev,
        [name]: digits,
      }));

      // Auto move focus if 10 digits entered
      if (digits.length === 10) {
        const formEl = e.target.form;
        if (formEl) {
          const elements = Array.from(formEl.elements).filter(
            (el) => el.tagName.toLowerCase() !== 'fieldset' && !el.disabled
          );
          const index = elements.indexOf(e.target);
          const next = elements[index + 1];
          if (next) next.focus();
        }
      }
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // ---------------- Validation helpers ----------------
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
  // Simple URL validator that accepts http/https and common URL characters
  const URL_RE = /^(https?:\/\/)[^\s$.?#].[^\s]*$/i;
  // Password: min 8 chars, at least one letter and one number
  const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&^_-]{8,}$/;

  const validateAll = (values) => {
    const e = {};

    // Required personal fields
    if (!values.first_name?.trim()) e.first_name = 'First name is required.';
    if (!values.last_name?.trim()) e.last_name = 'Last name is required.';
    if (!values.email?.trim()) e.email = 'Email is required.';
    else if (!EMAIL_RE.test(values.email.trim())) e.email = 'Enter a valid email address.';

    if (!values.password) e.password = 'Password is required.';
    else if (!PASSWORD_RE.test(values.password))
      e.password =
        'Password must be at least 8 characters and include at least one letter and one number.';

    // Company
    if (!values.company_name?.trim()) e.company_name = 'Company name is required.';

    // Mobile
    if (!values.mobile_number?.trim()) e.mobile_number = 'Mobile number is required.';
    else if (values.mobile_number.trim().length !== 10)
      e.mobile_number = 'Mobile number must be 10 digits.';

    // Location
    if (!values.country) e.country = 'Country is required.';
    if (!values.state) e.state = 'State is required.';
    if (!values.city) e.city = 'City is required.';
    if (!values.address?.trim()) e.address = 'Address is required.';

    // Website (optional but if present must be valid)
    if (values.website?.trim() && !URL_RE.test(values.website.trim()))
      e.website = 'Enter a valid website URL (include http/https).';

    return e;
  };

  // Close helper
  const handleClose = () => {
    if (typeof onClose === 'function') onClose();
    else navigate(-1);
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Allow browser native constraint validation first
    const formEl = document.getElementById('user-signup-form-popup');
    if (formEl && !formEl.checkValidity()) {
      formEl.reportValidity();
      return;
    }

    // Custom validation
    const validationErrors = validateAll(form);
    setErrors(validationErrors);
    // mark all touched so inline errors show
    setTouched({
      first_name: true,
      last_name: true,
      email: true,
      password: true,
      company_name: true,
      mobile_number: true,
      country: true,
      state: true,
      city: true,
      address: true,
      website: true,
    });

    if (Object.keys(validationErrors).length > 0) {
      toast.error('Please fix the highlighted errors before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await axios.post('/api/signup', form);
      toast.success(typeof data === 'string' ? data : 'User created successfully!');
      navigate('/api/organiser');
    } catch (error) {
      console.error(error);
      // Show a friendly message; include server message if present.
      const msg = error?.response?.data?.message || error?.message || 'Submission failed.';
      toast.error(`Submission failed! ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="User registration"
    >
      {/* Modal container sized 90% width and height */}
      <div className="bg-white w-[90%] h-[90%] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 shrink-0">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Logo" className="w-28" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">Create account</h2>
              <p className="text-sm text-gray-500">Fill in your details to sign up</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              aria-label="Close"
              className="text-gray-500 hover:text-red-600 text-3xl leading-none transition-colors"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
          <form
            id="user-signup-form-popup"
            onSubmit={handleSubmit}
            className="w-full max-w-4xl mx-auto rounded-3xl bg-white shadow-sm border border-gray-100 space-y-8 p-6"
            noValidate
          >
            {/* Personal Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  id="first_name"
                  label="First Name"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  required
                  onBlur={() => markTouched('first_name')}
                  error={touched.first_name ? errors.first_name : null}
                />
                <InputField
                  id="last_name"
                  label="Last Name"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  required
                  onBlur={() => markTouched('last_name')}
                  error={touched.last_name ? errors.last_name : null}
                />
                <InputField
                  id="email"
                  type="email"
                  label="Email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  onBlur={() => markTouched('email')}
                  error={touched.email ? errors.email : null}
                />
                <InputField
                  id="password"
                  type="password"
                  label="Password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  onBlur={() => markTouched('password')}
                  error={touched.password ? errors.password : null}
                />
              </div>
            </div>

            {/* Company Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Company Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  id="company_name"
                  label="Company Name"
                  name="company_name"
                  value={form.company_name}
                  onChange={handleChange}
                  required
                  onBlur={() => markTouched('company_name')}
                  error={touched.company_name ? errors.company_name : null}
                />
                <InputField
                  id="designation"
                  label="Designation"
                  name="designation"
                  value={form.designation}
                  onChange={handleChange}
                />
                <InputField
                  id="website"
                  type="url"
                  label="Website"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  onBlur={() => markTouched('website')}
                  error={touched.website ? errors.website : null}
                />
                <InputField
                  id="mobile_number"
                  label="Mobile Number"
                  name="mobile_number"
                  value={form.mobile_number}
                  onChange={handleChange}
                  required
                  onBlur={() => markTouched('mobile_number')}
                  error={touched.mobile_number ? errors.mobile_number : null}
                />
              </div>
            </div>

            {/* Location Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SelectField
                  id="country"
                  label="Country"
                  options={countries}
                  value={form.country}
                  onChange={(val) => handleSelect(val, 'country')}
                  isDisabled={false}
                  onBlur={() => markTouched('country')}
                  error={touched.country ? errors.country : null}
                />
                <SelectField
                  id="state"
                  label="State"
                  options={states}
                  value={form.state}
                  onChange={(val) => handleSelect(val, 'state')}
                  isDisabled={!form.country}
                  onBlur={() => markTouched('state')}
                  error={touched.state ? errors.state : null}
                />
                <SelectField
                  id="city"
                  label="City"
                  options={cities}
                  value={form.city}
                  onChange={(val) => handleSelect(val, 'city')}
                  isDisabled={!form.state}
                  onBlur={() => markTouched('city')}
                  error={touched.city ? errors.city : null}
                />
              </div>

              <div className="mt-6">
                <label htmlFor="address" className="block mb-2 text-sm font-semibold text-gray-700">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  onBlur={() => markTouched('address')}
                  rows={4}
                  placeholder="Enter your address"
                  required
                  aria-invalid={!!(touched.address && errors.address)}
                  aria-describedby={touched.address && errors.address ? 'address-error' : undefined}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    touched.address && errors.address ? 'border-red-500' : 'border-gray-300'
                  } bg-gray-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition resize-none`}
                />
                {touched.address && errors.address && (
                  <p id="address-error" className="text-xs text-red-600 mt-1">
                    {errors.address}
                  </p>
                )}
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex justify-end gap-4 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Reusable Input
const InputField = ({ id, label, name, value, onChange, type = 'text', required, placeholder, onBlur, error }) => (
  <div>
    <label htmlFor={id} className="block mb-2 text-sm font-semibold text-gray-700">
      {label}
      {required && <span className="text-red-600 ml-1">*</span>}
    </label>
    <input
      id={id}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder || label}
      required={required}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      maxLength={name === 'mobile_number' ? 10 : undefined}
      className={`w-full px-4 py-2 rounded-lg border ${error ? 'border-red-500' : 'border-gray-300'} bg-gray-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition`}
    />
    {error && (
      <p id={`${id}-error`} className="text-xs text-red-600 mt-1">
        {error}
      </p>
    )}
  </div>
);

// Reusable Select
const SelectField = ({ id, label, options, value, onChange, isDisabled, onBlur, error }) => (
  <div>
    <label className="block mb-2 text-sm font-semibold text-gray-700">{label}</label>
    <Select
      inputId={id}
      options={options}
      value={options.find((opt) => opt.value === value) || null}
      onChange={onChange}
      placeholder={`Select ${label.toLowerCase()}`}
      isDisabled={isDisabled}
      isClearable
      classNamePrefix="react-select"
      onBlur={onBlur}
    />
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
);

export default UserFormPopup;
