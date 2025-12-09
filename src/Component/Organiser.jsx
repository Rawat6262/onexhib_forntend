import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import VerticalMenu from "./menu";
import PopupForm from "./PopupForm";
import ExhibitionPopup from "./Exhibitionpop";
import OrganiserPopup from "./OrganiserDetails";
import ExhibitionEditPopup from "../Admin/organiserupdate";

const Organiser = () => {
  const [showorganiser, setorganiser] = useState(false);
  const [exhibitions, setExhibitions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [id,setId] = useState(null)
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState(null);
  
  // Fetch exhibitions
  const fetchExhibitions = async () => {
    try {
      const { data } = await axios.get("/api/Exhibition");

      if (Array.isArray(data) && data.length > 0) {
        setId(data[0]?.createdby || null); // safely access createdby
        setExhibitions(data);
        console.log("First exhibition created by:", data[0]?.createdby);
      } else {
        setId(null);
        setExhibitions([]);
        console.warn("No exhibitions found");
      }
    } catch (error) {
      console.error("Error fetching exhibitions:", error.message);
    }
  };


  

  useEffect(() => {
    fetchExhibitions();
  }, []);

  // Filtered & paginated data
  const filteredData = useMemo(() => {
    return exhibitions.filter((item) =>
      [item.exhibition_name, item.category, item.addedBy, item.exhibition_address].some((field) =>
        field?.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [exhibitions, search]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FFFFFF] text-gray-900 font-serif">
      <VerticalMenu />

      <div className="flex-1 w-full mt-8 flex flex-col border border-gray-300 md:ml-10 bg-white rounded-lg shadow-md overflow-y-auto">
        {/* Header */}
        <div className="h-20 w-full flex flex-col sm:flex-row justify-between items-center px-8 border-b border-gray-300 bg-gray-100 rounded-t-lg">
          <h1 className="flex-1 font-bold text-3xl tracking-wide">SEM GROUP</h1>
          <button
            onClick={() =>{setorganiser(true)}}
            className="h-10 w-full sm:w-64 border-2 border-blue-500 text-blue-500 hover:bg-blue-100 rounded-md font-semibold transition-colors"
          >
            View Organiser Details
          </button>
          {showorganiser && <OrganiserPopup Cl={()=> {setorganiser(false)}}   data={id}/> }
        </div>

        {/* Summary Cards */}
        <div className="w-[95%] mx-auto mt-6 flex flex-wrap gap-6 justify-start">
          {[{ title: "Exhibitions", value: exhibitions.length }, { title: "Companies", value: 1 }].map(
            (card) => (
              <div
                key={card.title}
                className="h-24 w-48 rounded-xl flex flex-col justify-center items-center bg-white border border-gray-300 shadow-sm"
              >
                <p className="text-lg font-medium text-gray-700">{card.title}</p>
                <p className="text-4xl font-bold text-gray-900">{card.value}</p>
              </div>
            )
          )}
        </div>

        {/* Table Section */}
        <div className="flex-1 w-[95%] mx-auto mt-8 rounded-b-lg border border-t-0 border-gray-300 bg-white shadow-sm pb-8 mb-8">
          {/* Controls */}
          <div className="py-4 w-full flex flex-col lg:flex-row justify-between gap-4 px-4 text-center">
            <h2 className="font-bold text-2xl sm:text-3xl text-gray-800">Exhibition List</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search Exhibitions"
                className="h-10 w-full sm:w-64 border border-gray-400 rounded-md text-gray-700 placeholder-gray-500 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                className="h-10 w-full sm:w-48 border-2 border-blue-500 text-blue-500 hover:bg-blue-100 rounded-md font-semibold transition-colors"
                onClick={() => setShowModal(true)  }
              >
                + Add Exhibition
              </button>
            </div>
          </div>

          {showModal && (
            <PopupForm
              onClose={() => {
                setShowModal(false);
                fetchExhibitions();
              }}
            />
          )}

          {/* Table */}
          <div className="flex-1 w-full overflow-x-auto text-left mt-6">
            <table className="w-full min-w-[700px] border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200 text-gray-800 border-b border-gray-300">
                  {["#", "Exhibition BY", "Exhibition Name", "Address", "Category", "Action"].map(
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
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-gray-600 italic">
                      No data found
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, index) => (
                   <tr
    key={item._id || index}
    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
  >
    <td className="px-4 py-3 border border-gray-300">
      {startIndex + index + 1}
    </td>

    <td className="px-4 py-3 border border-gray-300">
      {item.addedBy}
    </td>

    <td className="px-4 py-3 border border-gray-300">
      {item.exhibition_name}
    </td>

    <td className="px-4 py-3 border border-gray-300">
      {item.exhibition_address}
    </td>

    <td className="px-4 py-3 border border-gray-300">
      {item.category}
    </td>

    <td className="px-4 py-3 border border-gray-300 flex gap-2">
      <button
        className="border-2 border-blue-500 text-blue-500 rounded-md px-3 py-1 hover:bg-blue-100 transition-colors"
        onClick={() => navigate(`/organiser/${item._id}`)}
      >
        View
      </button>

      <button
        className="flex items-center gap-1 px-3 py-1 border border-green-500 text-green-500 rounded-md hover:bg-green-100 transition"
        onClick={() => setEditingId(item._id)}
      >
        Edit
      </button>
    </td>
  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
<ExhibitionEditPopup
      open={Boolean(editingId)}
      exhibitionId={editingId}
      onClose={() => setEditingId(null)}
    />
          {/* Pagination Controls */}
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
    </div>
  );
};

export default Organiser;
