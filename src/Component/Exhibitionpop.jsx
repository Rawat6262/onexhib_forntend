import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ExhibitionPopup({ onClose, exhibitionId }) {
  const [exhibition, setExhibition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch exhibition details
  const fetchExhibition = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get(`/api/find/exhibition/${exhibitionId}`);
      setExhibition(data);
    } catch (err) {
      console.error("Error fetching exhibition:", err.message);
      setError("Failed to load exhibition details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (exhibitionId) {
      fetchExhibition();
    }
  }, [exhibitionId]);

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

        {/* Header with Logo */}
        <div className="flex flex-col items-center mb-6">
         
          <h2 className="text-2xl font-bold text-gray-800">
            {exhibition?.exhibition_name || "Exhibition"}
          </h2>
        </div>

        {/* Loading State */}
        {loading && (
          <p className="text-center text-gray-500">Loading exhibition...</p>
        )}

        {/* Error State */}
        {error && !loading && (
          <p className="text-center text-red-500">{error}</p>
        )}

        {/* Exhibition Details */}
        {!loading && exhibition && (
          <>
            <div className="space-y-3 text-gray-700">
              <p>
                <span className="font-medium text-gray-900">📍 Address:</span>{" "}
                {exhibition.exhibition_address}
              </p>
              <p>
                <span className="font-medium text-gray-900">🏷 Category:</span>{" "}
                {exhibition.category}
              </p>
              <p>
                <span className="font-medium text-gray-900">🏢 Venue:</span>{" "}
                {exhibition.venue}
              </p>
              <p>
                <span className="font-medium text-gray-900">📅 Start Date:</span>{" "}
                { exhibition.starting_date}
              </p>
              <p>
                <span className="font-medium text-gray-900">⏳ End Date:</span>{" "}
                {exhibition.ending_date}
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
