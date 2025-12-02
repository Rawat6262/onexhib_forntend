import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminMenu from "./Menu.admin";
import UserPopupForm from "./Popneworganiser";

const AdminDashboard = () => {
  const [bigdata, setBigdata] = useState([]);
  const [company, setCompany] = useState(0);
  const [exhibition, setExhibition] = useState(0);
  const [product, setProduct] = useState(0);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const itemsPerPage = 6;

  // API calls & state updates
  const fetchDashboardData = useCallback(async () => {
    try {
      const result = await axios.get("/api/admin/signup");
      const result2 = await axios.get("/api/admin/exhibition");
      const result3 = await axios.get("/api/admin/company");
      const result4 = await axios.get("/api/admin/product");

      setBigdata(result.data || []);
      setExhibition(result2.data?.length || 0);
      setCompany(result3.data?.length || 0);
      setProduct(result4.data?.length || 0);

    } catch (e) {
      console.error("Error fetching dashboard data:", e);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Fixed and robust search filtering!
  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return bigdata;
    return bigdata.filter((item) =>
      [
        item?.first_name ?? "",
        item?.last_name ?? "",
        item?.email ?? "",
        item?.mobile_number ?? "",
        item?.company_name ?? "",
        item?.designation ?? "",
      ].some((field) =>
        String(field).toLowerCase().includes(query)
      )
    );
  }, [bigdata, search]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FFFFFF] text-gray-900 font-serif">
      <AdminMenu />

      <div className="flex-1 w-full mt-8 flex flex-col border border-gray-300 md:ml-10 bg-white rounded-lg shadow-md overflow-y-auto">
        {/* Header */}
        <div className="h-20 w-full flex items-center justify-between px-8 border-b border-gray-300 bg-gray-100 rounded-t-lg">
          <h1 className="font-bold text-3xl tracking-wide">Admin Dashboard</h1>
          <button
            onClick={() => setShowPopup(true)}
            className="h-10 w-48 border-2 border-blue-500 text-blue-500 hover:bg-blue-100 rounded-md font-semibold transition-colors"
          >
            + New Organiser
          </button>
        </div>

        {/* Summary Cards */}
        <div className="w-[95%] mx-auto mt-6 flex flex-wrap gap-6 justify-start">
          <SummaryCard title="Organiser" value={bigdata.length} />
          <SummaryCard title="Exhibition" value={exhibition} />
          <SummaryCard title="Company" value={company} />
          <SummaryCard title="Product" value={product} />
        </div>

        {/* Search Bar */}
        <div className="py-4 w-[95%] mx-auto flex flex-col lg:flex-row justify-between gap-4 px-4 mt-6">
          <h2 className="font-bold text-2xl sm:text-3xl text-gray-800">
            Organisers
          </h2>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search organisers"
            className="h-10 w-full sm:w-64 border border-gray-400 rounded-md text-gray-700 placeholder-gray-500 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        <div className="flex-1 w-[95%] mx-auto mt-4 rounded-b-lg border border-t-0 border-gray-300 bg-white shadow-sm pb-8 mb-8 overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200 text-gray-800 border-b border-gray-300">
                {["#", "Full Name", "E-mail", "Phone", "Company", "Designation"].map((header) => (
                  <th key={header} className="px-4 py-3 border-r border-gray-300 last:border-r-0">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-600 italic">
                    No data found
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <tr key={item._id || index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 border border-gray-300">{startIndex + index + 1}</td>
                    <td className="px-4 py-3 border border-gray-300">
                      {`${item.first_name || ""} ${item.last_name || ""}`.trim()}
                    </td>
                    <td className="px-4 py-3 border border-gray-300">{item.email}</td>
                    <td className="px-4 py-3 border border-gray-300">{item.mobile_number}</td>
                    <td className="px-4 py-3 border border-gray-300">{item.company_name}</td>
                    <td className="px-4 py-3 border border-gray-300">{item.designation}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="mt-6 flex justify-center gap-4 items-center">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border-2 border-blue-500 text-blue-500 rounded-md hover:bg-blue-100 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-700 font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border-2 border-blue-500 text-blue-500 rounded-md hover:bg-blue-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Popup */}
      {showPopup && (
        <UserPopupForm
          onClose={() => setShowPopup(false)}

        />
      )}
    </div>
  );
};

const SummaryCard = ({ title, value }) => (
  <div className="h-24 w-48 rounded-xl flex flex-col justify-center items-center bg-white border border-gray-300 shadow-sm">
    <p className="text-lg font-medium text-gray-700">{title}</p>
    <p className="text-4xl font-bold text-gray-900">{value}</p>
  </div>
);

export default AdminDashboard;
