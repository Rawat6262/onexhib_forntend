import React, { useState, useMemo } from 'react';
import { Country, State, City } from 'country-state-city';
import Select from 'react-select';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import logo from '../assets/Dark.png';

function UserForm() {
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

  /* ------------------ DROPDOWN OPTIONS ------------------ */
  const designationOptions = [
    { value: 'organiser', label: 'Organiser' },
    { value: 'exhibition_service', label: 'Exhibition Service' },
  ];

  /* ------------------ COUNTRY / STATE / CITY ------------------ */
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

  const markTouched = (field) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSelect = (option, field) => {
    setForm((prev) => ({
      ...prev,
      [field]: option ? option.value : '',
      ...(field === 'country' ? { state: '', city: '' } : {}),
      ...(field === 'state' ? { city: '' } : {}),
    }));
    markTouched(field);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'mobile_number') {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      setForm((prev) => ({ ...prev, mobile_number: digits }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  /* ------------------ VALIDATION ------------------ */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
  const PASSWORD_RE =
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&^_-]{8,}$/;

  const validateAll = (values) => {
    const e = {};

    if (!values.first_name.trim())
      e.first_name = 'First name is required.';
    if (!values.last_name.trim())
      e.last_name = 'Last name is required.';

    if (!values.email.trim())
      e.email = 'Email is required.';
    else if (!EMAIL_RE.test(values.email))
      e.email = 'Invalid email address.';

    if (!values.password)
      e.password = 'Password is required.';
    else if (!PASSWORD_RE.test(values.password))
      e.password =
        'Password must be 8+ characters with letters and numbers.';

    // company_name ❌ NOT REQUIRED
    // website ❌ NOT REQUIRED

    if (!values.mobile_number)
      e.mobile_number = 'Mobile number is required.';
    else if (values.mobile_number.length !== 10)
      e.mobile_number = 'Mobile number must be 10 digits.';

    if (!values.country) e.country = 'Country is required.';
    if (!values.state) e.state = 'State is required.';
    if (!values.city) e.city = 'City is required.';
    if (!values.address.trim())
      e.address = 'Address is required.';

    return e;
  };

  /* ------------------ SUBMIT ------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateAll(form);
    setErrors(validationErrors);
    setTouched({
      first_name: true,
      last_name: true,
      email: true,
      password: true,
      mobile_number: true,
      country: true,
      state: true,
      city: true,
      address: true,
    });

    if (Object.keys(validationErrors).length) {
      toast.error('Fix the errors before submitting');
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.post('/api/signup', form);
      toast.success('User created successfully');
      navigate('/api/organiser');
    } catch (err) {
      toast.error(
        err?.response?.data?.message || 'Submission failed'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ------------------ UI ------------------ */
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-4xl p-8 rounded-3xl bg-white shadow-2xl border space-y-8"
      >
        <div className="flex justify-center">
          <img src={logo} className="w-40" alt="logo" />
        </div>

        {/* PERSONAL */}
        <div className="grid md:grid-cols-2 gap-6">
          <InputField label="First Name" name="first_name" value={form.first_name} onChange={handleChange} error={errors.first_name} />
          <InputField label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} error={errors.last_name} />
          <InputField label="Email" type="email" name="email" value={form.email} onChange={handleChange} error={errors.email} />
          <InputField label="Password" type="password" name="password" value={form.password} onChange={handleChange} error={errors.password} />
        </div>

        {/* COMPANY */}
        <div className="grid md:grid-cols-2 gap-6">
          <InputField label="Company Name (Optional)" name="company_name" value={form.company_name} onChange={handleChange} />

          <SelectField
            label="Designation"
            options={designationOptions}
            value={form.designation}
            onChange={(val) =>
              setForm((p) => ({
                ...p,
                designation: val ? val.value : '',
              }))
            }
          />

          <InputField label="Website (Optional)" name="website" value={form.website} onChange={handleChange} />
          <InputField label="Mobile Number" name="mobile_number" value={form.mobile_number} onChange={handleChange} error={errors.mobile_number} />
        </div>

        {/* LOCATION */}
        <div className="grid md:grid-cols-3 gap-6">
          <SelectField label="Country" options={countries} value={form.country} onChange={(v) => handleSelect(v, 'country')} />
          <SelectField label="State" options={states} value={form.state} onChange={(v) => handleSelect(v, 'state')} />
          <SelectField label="City" options={cities} value={form.city} onChange={(v) => handleSelect(v, 'city')} />
        </div>

        <textarea
          className="w-full border rounded-lg p-3"
          placeholder="Address"
          name="address"
          value={form.address}
          onChange={handleChange}
        />

        <button
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}

/* ------------------ REUSABLE COMPONENTS ------------------ */

const InputField = ({ label, error, ...props }) => (
  <div>
    <label className="block mb-1 font-semibold">{label}</label>
    <input {...props} className="w-full border rounded-lg px-3 py-2" />
    {error && <p className="text-red-500 text-xs">{error}</p>}
  </div>
);

const SelectField = ({ label, options, value, onChange }) => (
  <div>
    <label className="block mb-1 font-semibold">{label}</label>
    <Select
      options={options}
      value={options.find((o) => o.value === value) || null}
      onChange={onChange}
      isClearable
    />
  </div>
);

export default UserForm;
