import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminMenu from "./Menu.admin";
import PopupForm from "../Component/PopupForm"; 
import { toast } from "sonner";

const AdminCompany = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [exhibition, setExhibition] = useState(0);
  const [companyCount, setCompanyCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // ✅ Fetch all companies
  const fetchCompanies = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/admin/company");
      const { data2 } = await axios.get("/api/admin/exhibition");
      const { data3 } = await axios.get("/api/admin/product");
      if (Array.isArray(data)) {
        setCompanies(data);
        setCompanyCount(data.length);
        setProductCount(data.length);
        setExhibition(data.length);
      } else {
        setCompanies([]);
        setCompanyCount(0);
      }
    } catch (err) {
      console.error("❌ Error fetching companies:", err);
      toast.error("Failed to fetch companies");
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // ✅ Delete all companies
  const handleDeleteAllCompanies = async () => {
    try {
      setLoading(true);
      const { data } = await axios.delete("/api/admin/deleteallcompany");
      toast.success(data.message || "All companies deleted successfully");
      setShowDeleteConfirm(false);
      fetchCompanies();
    } catch (err) {
      console.error("❌ Error deleting companies:", err);
      toast.error("Failed to delete companies");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Search filter
  const filteredCompanies = useMemo(() => {
    const query = search.toLowerCase();
    return companies.filter((c, index) => {
      const rowNumber = (index + 1).toString();
      return (
        rowNumber.includes(query) ||
        (c.company_name || "").toLowerCase().includes(query) ||
        (c.address || "").toLowerCase().includes(query) ||
        (c.mobile_number || "").toLowerCase().includes(query)
      );
    });
  }, [companies, search]);

  // ✅ Pagination
  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / itemsPerPage));
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
      <AdminMenu />

      {/* Main Content */}
      <div className="flex-1 w-full mt-8 flex flex-col border border-gray-300 md:ml-10 bg-white rounded-lg shadow-md overflow-y-auto">
        {/* Header */}
        <div className="h-20 w-full flex flex-col sm:flex-row justify-between items-center px-8 border-b border-gray-300 bg-gray-100 rounded-t-lg">
          <h1 className="font-bold text-3xl tracking-wide">Company Dashboard</h1>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="h-10 w-48 border border-red-500 text-red-500 hover:bg-red-100 rounded-md font-semibold transition-colors"
          >
            Delete All Company
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-96">
              <h2 className="text-xl font-bold mb-4 text-center">
                Are you sure?
              </h2>
              <p className="text-gray-600 text-center mb-6">
                This will permanently delete all companies. This action cannot be undone.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border-2 border-gray-400 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAllCompanies}
                  className="px-4 py-2 border-2 border-red-500 text-red-500 rounded-md hover:bg-red-100 transition-colors"
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="w-[95%] mx-auto mt-6 flex flex-wrap gap-6 justify-start">
          {[
            { title: "Total Companies", value: companyCount },
            { title: "Exhibitions", value: exhibition },
            { title: "Products", value: productCount },
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
          <div className="py-4 w-full flex flex-col lg:flex-row justify-between gap-4 px-4">
            <h2 className="font-bold text-2xl sm:text-3xl text-gray-800">
              Company List
            </h2>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, address, mobile number or #..."
              className="h-10 w-full sm:w-64 border border-gray-400 rounded-md text-gray-700 placeholder-gray-500 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Table */}
          <div className="flex-1 w-full overflow-x-auto text-left mt-6">
            <table className="w-full min-w-[700px] border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200 text-gray-800 border-b border-gray-300">
                  {["#", "Company Name", "Address", "Mobile Number", "Action"].map(
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
                        {c.company_address}
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

      {/* Popup Form */}
      {showForm && (
        <PopupForm
          Close={() => setShowForm(false)}
          onCompanyAdded={fetchCompanies}
        />
      )}
    </div>
  );
};

export default AdminCompany;
