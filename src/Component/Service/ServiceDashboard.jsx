import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import VerticalMenu from "../Menu";
import ServicePopupForm from "./Service.popupform";

const ExhibitionService = () => {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
const [showModal, setShowModal] = useState(false);
  const itemsPerPage = 5;

  // Fetch services
  const fetchServices = async () => {
    try {
      const res = await axios.get("/api/get/service");
      setServices(res.data.data || []);
    } catch (error) {
      console.error("Error fetching services:", error.message);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Search filter
  const filteredData = useMemo(() => {
    return services.filter((item) =>
      [
        item.full_name,
        item.service_name,
        item.country,
        item.state,
        item.city,
        item.mobile_number
      ].some((field) =>
        field?.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [services, search]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white text-gray-900 font-serif">
      <VerticalMenu />

      <div className="flex-1 mt-8 md:ml-10 border border-gray-300 bg-white rounded-lg shadow-md overflow-y-auto">

        {/* Header */}
        <div className="h-20 flex justify-between items-center px-8 border-b bg-gray-100 rounded-t-lg">
          <h1 className="font-bold text-3xl tracking-wide">
            Exhibition Service
          </h1>
        </div>

        {/* Summary Cards */}
        <div className="w-[95%] mx-auto mt-6 flex gap-6">
          <div className="h-24 w-48 rounded-xl flex flex-col justify-center items-center bg-white border shadow-sm">
            <p className="text-lg text-gray-700">Total Services</p>
            <p className="text-4xl font-bold">{services.length}</p>
          </div>
        </div>

        {/* Table Section */}
        <div className="w-[95%] mx-auto mt-8 border border-gray-300 rounded-lg shadow-sm pb-8 mb-8">

          {/* Controls */}
       <div className="py-4 flex flex-col sm:flex-row justify-between items-center gap-4 px-4">
  <h2 className="font-bold text-2xl">Service List</h2>

  {/* Right Side Controls */}
  <div className="flex flex-col sm:flex-row gap-3 items-center">
    <input
      type="text"
      placeholder="Search Services"
      value={search}
      onChange={(e) => {
        setSearch(e.target.value);
        setCurrentPage(1);
      }}
      className="h-10 w-64 border border-gray-400 rounded-md px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
    />

    <button
      className="h-10 px-6 border-2 border-blue-500 text-blue-500 rounded-md font-semibold hover:bg-blue-100 transition-colors"
      onClick={() => setShowModal(true)}   // optional
    >
      + Add Service
    </button>
{showModal && (
  <ServicePopupForm
    onClose={() => setShowModal(false)}
    onSuccess={fetchServices}
  />
)}

  </div>
</div>


          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200 border-b">
                  {[
                    "#",
                    "Full Name",
                    "Service Name",
                    "Country",
                    "State",
                    "City",
                    "Address",
                    "Mobile"
                  ].map((head) => (
                    <th
                      key={head}
                      className="px-4 py-3 border border-gray-300"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-6 text-center italic">
                      No services found
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, index) => (
                   <tr
  key={item._id}
  className={`text-center ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
>
  <td className="px-4 py-3 border">
    {startIndex + index + 1}
  </td>
  <td className="px-4 py-3 border">
    {item.full_name}
  </td>
  <td className="px-4 py-3 border">
    {item.service_name}
  </td>
  <td className="px-4 py-3 border">
    {item.country}
  </td>
  <td className="px-4 py-3 border">
    {item.state}
  </td>
  <td className="px-4 py-3 border">
    {item.city}
  </td>
  <td className="px-4 py-3 border">
    {item.address}
  </td>
  <td className="px-4 py-3 border">
    {item.mobile_number}
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
              className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md disabled:opacity-50"
            >
              Previous
            </button>

            <span className="font-semibold">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ExhibitionService;
