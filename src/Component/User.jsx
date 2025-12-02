import React, { useEffect, useState, useMemo } from "react";
import VerticalMenu from "./Menu";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
// import PopupForms from "./ExhibitionDetail";
import PopupForms from "./companypopup";
import ExhibitionPopup from "./Exhibitionpop";
import { toast } from "sonner";

function User() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exhibition, setExhibition] = useState({});
  const [companies, setCompanies] = useState([]);
  const [showdetail, setDetails] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  // ✅ Delete exhibition
  const deleteExhibition = async () => {
    try {
      if (!window.confirm("Are you sure you want to delete this exhibition?"))
        return;

      await axios.delete(`/api/delete/exhibition/${id}`);
      toast.success("Exhibition deleted successfully!");
      navigate("/api/organiser"); // ✅ fixed route
    } catch (err) {
      console.error("❌ Error deleting exhibition:", err);
      toast.error("Failed to delete exhibition");
    }
  };

  // ✅ Fetch exhibition
  const fetchExhibitionData = async () => {
    try {
      const { data } = await axios.post("/api/findexhibition", { id });
      setExhibition(data);
    } catch (err) {
      console.error("❌ Error fetching exhibition:", err);
    }
  };

  // ✅ Fetch companies under this exhibition
  const fetchCompany = async () => {
    try {
      const { data } = await axios.get(`/api/company/${id}`);
      setCompanies(Array.isArray(data) ? data : [data]);
    } catch (error) {
      console.error(
        "❌ Error fetching company:",
        error.response?.data?.message || error.message
      );
    }
  };

  // ✅ Filter + paginate
  const filteredCompanies = useMemo(() => {
    return companies.filter((c, index) => {
      const query = search.toLowerCase();
      const rowNumber = (index + 1).toString();
      return (
        rowNumber.includes(query) ||
        (c.company_name || "").toLowerCase().includes(query) ||
        (c.company_email || "").toLowerCase().includes(query) ||
        (c.company_phone_number || "").toLowerCase().includes(query)
      );
    });
  }, [companies, search]);

  useEffect(() => {
    fetchExhibitionData();
    fetchCompany();
  }, [id]);

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCompanies = filteredCompanies.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FFFFFF] text-gray-900 font-serif">
      {/* Sidebar */}
      <VerticalMenu />

      {/* Main Content */}
      <div className="flex-1 w-full mt-8 flex flex-col border border-gray-300 md:ml-10 bg-white rounded-lg shadow-md overflow-y-auto">
        {/* Header */}
        <div className="h-20 w-full flex flex-col sm:flex-row justify-between items-center px-8 border-b border-gray-300 bg-gray-100 rounded-t-lg">
          <h1 className="flex-1 font-bold text-3xl tracking-wide">
            {exhibition.exhibition_name || "Exhibition"}
          </h1>
          <div className="flex gap-3">
            {/* Blue Button */}
            <button
              className="h-10 w-48 border border-blue-500 text-blue-500 hover:bg-blue-100 rounded-md font-semibold transition-colors"
              onClick={() => setDetails(true)}
            >
              Exhibition Details
            </button>
            {showdetail && (
              <ExhibitionPopup
                onClose={() => setDetails(false)}
                exhibitionId={id}
              />
            )}
            {/* Red Button */}
            <button
              className="h-10 w-48 border border-red-500 text-red-500 hover:bg-red-100 rounded-md font-semibold transition-colors"
              onClick={deleteExhibition}
            >
              Delete Exhibition
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="w-[95%] mx-auto mt-6 flex flex-wrap gap-6 justify-start">
          {[
            { title: "Total Companies", value: companies.length },
            { title: "Exhibition Stats", value: "Active" },
          ].map((card) => (
            <div
              key={card.title}
              className="h-24 w-48 rounded-xl flex flex-col justify-center items-center bg-white border border-gray-300 shadow-sm"
            >
              <p className="text-lg font-medium text-gray-700">{card.title}</p>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Table Section */}
        <div className="flex-1 w-[95%] mx-auto mt-8 rounded-b-lg border border-t-0 border-gray-300 bg-white shadow-sm pb-8 mb-8">
          {/* Controls */}
          <div className="py-4 w-full flex flex-col lg:flex-row justify-between gap-4 px-4 text-center">
            <h2 className="font-bold text-2xl sm:text-3xl text-gray-800">
              Company List
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name, email, phone or #..."
                className="h-10 w-full sm:w-64 border border-gray-400 rounded-md text-gray-700 placeholder-gray-500 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />

              {/* Add Company */}
              <button
                onClick={() => setShowForm(true)}
                className="h-10 w-full sm:w-48 border border-blue-500 text-blue-500 hover:bg-blue-100 rounded-md font-semibold transition-colors"
              >
                + Add Company
              </button>
              {showForm && (
                <PopupForms
                  Close={() => setShowForm(false)}
                  data={id}
                  onCompanyAdded={fetchCompany} // ✅ refresh companies after add
                />
              )}

              {/* Add Floor Plan */}
             
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 w-full overflow-x-auto text-left mt-6">
            <table className="w-full min-w-[700px] border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200 text-gray-800 border-b border-gray-300">
                  {["#", "Company Name", "Email", "Phone", "Action"].map(
                    (header) => (
                      <th
                        key={header}
                        className="px-4 py-3 border-r border-gray-300 last:border-r-0"
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedCompanies.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-6 text-center text-gray-600 italic"
                    >
                      No companies found
                    </td>
                  </tr>
                ) : (
                  paginatedCompanies.map((c, index) => (
                    <tr
                      key={c._id || index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-4 py-3 border border-gray-300">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-4 py-3 border border-gray-300">
                        {c.company_name}
                      </td>
                      <td className="px-4 py-3 border border-gray-300">
                        {c.company_email}
                      </td>
                      <td className="px-4 py-3 border border-gray-300">
                        {c.company_phone_number}
                      </td>
                      <td className="px-4 py-3 border border-gray-300">
                        <button
                          onClick={() => navigate(`/company/${c._id}`)}
                          className="border border-blue-500 text-blue-500 rounded-md px-3 py-1 hover:bg-blue-100 transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-center gap-4 items-center">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-100 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-700 font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default User;
