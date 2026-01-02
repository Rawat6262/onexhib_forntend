import React, { useState } from "react";
import axios from "axios";

const ServicePopupForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    full_name: "",
    service_name: "",
    country: "",
    address: "",
    state: "",
    city: "",
    mobile_number: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post("/api/add/service", formData);
      onSuccess(); // refresh list
      onClose();   // close popup
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-xl rounded-lg shadow-lg">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-bold">Add Exhibition Service</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          <input
            type="text"
            name="full_name"
            placeholder="Full Name"
            value={formData.full_name}
            onChange={handleChange}
            required
            className="w-full h-10 border rounded-md px-3"
          />

          <select
            name="service_name"
            value={formData.service_name}
            onChange={handleChange}
            required
            className="w-full h-10 border rounded-md px-3"
          >
            <option value="">Select Service</option>
            <option>Printing</option>
            <option>Furniture Rental</option>
            <option>LED / TV Rental</option>
            <option>Fabrication</option>
            <option>Protocol Staff</option>
            <option>Catalog Printing</option>
            <option>Corporate Gifting</option>
          </select>

          <input
            type="text"
            name="country"
            placeholder="Country"
            value={formData.country}
            onChange={handleChange}
            required
            className="w-full h-10 border rounded-md px-3"
          />

          <input
            type="text"
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleChange}
            required
            className="w-full h-10 border rounded-md px-3"
          />

          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            required
            className="w-full h-10 border rounded-md px-3"
          />

          <textarea
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            required
            rows="3"
            className="w-full border rounded-md px-3 py-2"
          />

          <input
            type="text"
            name="mobile_number"
            placeholder="Mobile Number"
            value={formData.mobile_number}
            onChange={handleChange}
            required
            className="w-full h-10 border rounded-md px-3"
          />

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border rounded-md text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Service"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ServicePopupForm;
