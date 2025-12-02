import React, { useEffect, useState } from "react";
import axios from "axios";

export default function OrganiserPopup({Cl : onClose,data: organiserId }) {
  const [organiser, setOrganiser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get(`/api/find/signup/${organiserId}`);
      setOrganiser(data);
    } catch (err) {
      console.error("Error fetching organiser:", err.message);
      setError("Failed to load organiser details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organiserId) {
      fetchData();
    }
  }, [organiserId]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-lg relative animate-fadeIn">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        {/* Loading State */}
        {loading && (
          <p className="text-center text-gray-500">Loading organiser...</p>
        )}

        {/* Error State */}
        {error && !loading && (
          <p className="text-center text-red-500">{error}</p>
        )}

        {/* Organiser Details */}
        {!loading && organiser && (
          <>
            {/* Header with Avatar */}
            <div className="flex flex-col items-center mb-6">
              
              <h2 className="text-xl font-bold text-gray-900">
                {organiser.first_name} {organiser.last_name}
              </h2>
              
            </div>

            {/* Info */}
            <div className="space-y-3 text-gray-700">
              <p>
                <span className="font-medium text-gray-900">📍 Address:</span>{" "}
                {organiser.address}
              </p>
              <p>
                <span className="font-medium text-gray-900">✉️ Email:</span>{" "}
                {organiser.email}
              </p>
              <p>
                <span className="font-medium text-gray-900">📞 Phone:</span>{" "}
                {organiser.mobile_number}
              </p>
              <p>
                <span className="font-medium text-gray-900">🏢 Company:</span>{" "}
                {organiser.company_name}
              </p>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
