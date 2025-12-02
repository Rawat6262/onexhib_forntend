import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import VerticalMenu from "./Menu";
import ProductPopupForm from "./Product_popup";

export default function CompanyDetail() {
  const { id } = useParams();
  const [showForm, setShowForm] = useState(false);
  const [company, setCompany] = useState({});
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  /** ✅ Fetch products with memoized function */
  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/product/${id}`);
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Error fetching products:", error.message);
    }
  }, [id]);

  /** ✅ Fetch company with memoized function */
  const fetchCompany = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/company/addproduct/${id}`);
      setCompany(data || {});
    } catch (error) {
      console.error("❌ Error fetching company:", error.message);
    }
  }, [id]);

  /** ✅ Run both fetches on mount */
  useEffect(() => {
    fetchCompany();
    fetchProducts();
  }, [fetchCompany, fetchProducts]);

  /** ✅ Filtered product list */
  const filteredData = useMemo(() => {
    const searchTerm = search.toLowerCase();
    return products.filter((item) =>
      [item.product_name, item.category, item.price].some((field) =>
        field?.toString().toLowerCase().includes(searchTerm)
      )
    );
  }, [products, search]);

  /** ✅ Pagination logic */
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  /** ✅ Brochure handler */
  const handleBrochureDownload = () => {
    if (!company?._id) return console.error("Company ID not available yet");
    window.open(`/api/brochure/${company._id}`, "_blank");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white text-gray-900 font-serif">
      <VerticalMenu />

      <main className="flex-1 mt-2 md:ml-10 p-4 sm:p-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-300 p-4 sm:p-6">
          {/* HEADER */}
          <header className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-300 pb-4">
            <h1 className="font-bold text-2xl sm:text-3xl">
              {company.company_name || "Loading..."}
            </h1>
            <button
              onClick={handleBrochureDownload}
              className="h-10 w-full sm:w-64 border border-blue-600 text-blue-600 bg-white hover:bg-blue-600 hover:text-white rounded-md font-semibold transition-colors"
            >
              Download Brochure
            </button>
          </header>

          {/* SUMMARY */}
          <section className="mt-6 flex flex-wrap gap-4">
            <SummaryCard label="Products" value={products.length} />
          </section>

          {/* COMPANY INFO */}
          <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 border rounded-xl shadow-sm bg-gray-50 space-y-1">
              <p>
                <b>Phone:</b> {company.company_phone_number}
              </p>
              <p>
                <b>E-Mail:</b> {company.company_email}
              </p>
              <p>
                <b>Address:</b> {company.company_address}
              </p>
            </div>
            <div className="p-5 border rounded-xl shadow-sm bg-gray-50">
              <p className="font-bold text-gray-800">About</p>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                {company.about_company || "This is a demo about section."}
              </p>
            </div>
          </section>

          {/* PRODUCT LIST */}
          <section className="mt-8 border rounded-lg shadow-sm bg-white p-4">
            {/* Controls */}
            <div className="flex flex-col lg:flex-row justify-between gap-4 items-center">
              <div className="text-center lg:text-left">
                <h2 className="font-bold text-2xl sm:text-3xl text-gray-800">
                  Product List
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search Products"
                  className="h-10 w-full sm:w-64 border border-gray-400 rounded-md px-3 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                />
                <button
                  className="h-10 w-full sm:w-48 border border-blue-600 text-blue-600 bg-white hover:bg-blue-600 hover:text-white rounded-md font-semibold transition-colors"
                  onClick={() => setShowForm(true)}
                >
                  + Add Product
                </button>
              </div>
            </div>

            {/* Table */}
            <ProductTable
              paginatedData={paginatedData}
              startIndex={startIndex}
            />

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          </section>
        </div>
      </main>

      {/* Popup Form */}
      {showForm && (
        <ProductPopupForm
          Close={() => setShowForm(false)}
          data={id}
          refreshProducts={fetchProducts}
          exid={company.createdBy}
        />
      )}
    </div>
  );
}

/* ----------------- SUBCOMPONENTS ----------------- */

function SummaryCard({ label, value }) {
  return (
    <div className="h-24 w-48 rounded-xl flex flex-col justify-center items-center bg-white border border-gray-300 shadow-sm">
      <p className="text-lg font-medium text-gray-700">{label}</p>
      <p className="text-4xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function ProductTable({ paginatedData, startIndex }) {
  return (
    <div className="overflow-x-auto mt-6">
      <table className="w-full min-w-[700px] border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200 text-gray-800">
            {["#", "Product Name", "Category", "Price", "Action"].map(
              (header) => (
                <th
                  key={header}
                  className="px-4 py-3 border border-gray-300"
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
              <td
                colSpan="5"
                className="p-6 text-center text-gray-600 italic"
              >
                No products found
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
                  {item.product_name}
                </td>
                <td className="px-4 py-3 border border-gray-300">
                  {item.category}
                </td>
                <td className="px-4 py-3 border border-gray-300">
                  {item.price}
                </td>
                <td className="px-4 py-3 border border-gray-300 flex gap-2">
                  <button className="px-3 py-1 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-colors">
                    View
                  </button>
                  <button className="px-3 py-1 border border-red-600 text-red-600 rounded-md hover:bg-red-600 hover:text-white transition-colors">
                    Edit
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function Pagination({ currentPage, totalPages, setCurrentPage }) {
  return (
    <div className="mt-6 flex justify-center gap-4 items-center">
      <button
        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white disabled:opacity-50 transition-colors"
      >
        Previous
      </button>
      <span className="text-gray-700 font-semibold">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white disabled:opacity-50 transition-colors"
      >
        Next
      </button>
    </div>
  );
}
