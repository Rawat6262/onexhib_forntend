import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminMenu from "./Menu.admin";
import ProductPopupForm from "../Component/Product_popup";
import { toast } from "sonner";

export default function AdminProducts() {
  const navigate = useNavigate();

  // State
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // ✅ Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/admin/product");
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Error fetching products:", error.message);
      toast.error("Failed to fetch products");
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ✅ Delete all products
  const handleDeleteAll = async () => {
    try {
      if (!window.confirm("Are you sure you want to delete all products?")) return;
      await axios.delete("/api/admin/deleteallproduct");
      toast.success("All products deleted successfully");
      fetchProducts();
    } catch (err) {
      console.error("❌ Error deleting products:", err.message);
      toast.error("Failed to delete products");
    }
  };

  // ✅ Filtered + Paginated Data
  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p, index) =>
      [(index + 1).toString(), p.product_name, p.category, p.price]
        .some((field) => field?.toString().toLowerCase().includes(q))
    );
  }, [products, search]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white text-gray-900 font-serif">
      {/* Sidebar */}
      <AdminMenu />

      {/* Main Content */}
      <div className="flex-1 w-full mt-8 flex flex-col border border-gray-300 md:ml-10 bg-white rounded-lg shadow-md overflow-y-auto">
        {/* Header */}
        <div className="h-20 w-full flex flex-col sm:flex-row justify-between items-center px-8 border-b border-gray-300 bg-gray-100 rounded-t-lg">
          <h1 className="font-bold text-3xl tracking-wide">Product Dashboard</h1>
          <button
            onClick={handleDeleteAll}
            className="h-10 w-48 border border-red-500 text-red-500 hover:bg-red-100 rounded-md font-semibold transition-colors"
          >
            Delete All Products
          </button>
        </div>

        {/* Summary Card */}
        <div className="w-[95%] mx-auto mt-6 flex flex-wrap gap-6">
          <div className="h-24 w-48 rounded-xl flex flex-col justify-center items-center bg-white border border-gray-300 shadow-sm">
            <p className="text-lg font-medium text-gray-700">Total Products</p>
            <p className="text-3xl font-bold text-gray-900">{products.length}</p>
          </div>
        </div>

        {/* Table Section */}
        <div className="flex-1 w-[95%] mx-auto mt-8 rounded-b-lg border border-t-0 border-gray-300 bg-white shadow-sm pb-8 mb-8">
          {/* Controls */}
          <div className="py-4 w-full flex flex-col lg:flex-row justify-between gap-4 px-4">
            <h2 className="font-bold text-2xl sm:text-3xl text-gray-800">Product List</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name, category or price..."
                className="h-10 w-full sm:w-64 border border-gray-400 rounded-md text-gray-700 placeholder-gray-500 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
             
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 w-full overflow-x-auto text-left mt-6">
            <table className="w-full min-w-[700px] border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200 text-gray-800 border-b border-gray-300">
                  {["#", "Product Name", "Category", "Price", "Action"].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 border-r border-gray-300 last:border-r-0"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-6 text-center text-gray-600 italic"
                    >
                      No products found
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((p, index) => (
                    <tr
                      key={p._id || index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-4 py-3 border border-gray-300">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-4 py-3 border border-gray-300">
                        {p.product_name}
                      </td>
                      <td className="px-4 py-3 border border-gray-300">
                        {p.category}
                      </td>
                      <td className="px-4 py-3 border border-gray-300">
                        {p.price}
                      </td>
                      <td className="px-4 py-3 border border-gray-300">
                        <button
                          onClick={() => navigate(`/product/${p._id}`)}
                          className="px-3 py-1 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-100 transition-colors"
                        >
                          View
                        </button>
                        <button
                          className="ml-2 px-3 py-1 border border-red-500 text-red-500 rounded-md hover:bg-red-100 transition-colors"
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

      {/* Product Popup */}
      {showForm && (
        <ProductPopupForm
          Close={() => setShowForm(false)}
          refreshProducts={fetchProducts}
        />
      )}
    </div>
  );
}
