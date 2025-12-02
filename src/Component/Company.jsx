import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import VerticalMenu from "./Menu";
import ProductPopupForm from "./Product_popup";

export default function CompanyDetail() {
  const { id } = useParams();

  const [showForm, setShowForm] = useState(false);
  const [company, setCompany] = useState(null);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isLoadingCompany, setIsLoadingCompany] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [errorCompany, setErrorCompany] = useState(null);
  const [errorProducts, setErrorProducts] = useState(null);

  const itemsPerPage = 5;

  /** 🔹 Fetch products */
  const fetchProducts = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoadingProducts(true);
      setErrorProducts(null);
      const { data } = await axios.get(`/api/product/${id}`);
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      setErrorProducts("Failed to load products. Please try again.");
    } finally {
      setIsLoadingProducts(false);
    }
  }, [id]);

  /** 🔹 Fetch company */
  const fetchCompany = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoadingCompany(true);
      setErrorCompany(null);
      const { data } = await axios.get(`/api/company/addproduct/${id}`);
      console.log(data)
      setCompany(data || null);
    } catch (error) {
      console.error("❌ Error fetching company:", error);
      setErrorCompany("Failed to load company details. Please try again.");
    } finally {
      setIsLoadingCompany(false);
    }
  }, [id]);

  /** 🔹 Run both fetches on mount / id change */
  useEffect(() => {
    fetchCompany();
    fetchProducts();
  }, [fetchCompany, fetchProducts]);

  /** 🔹 Filtered product list */
  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;

    return products.filter((item) =>
      [item.product_name, item.category, item.price].some((field) =>
        field?.toString().toLowerCase().includes(term)
      )
    );
  }, [products, search]);

  /** 🔹 Pagination logic */
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / itemsPerPage)
  );
  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSafe - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  /** 🔹 Brochure handler */
  const handleBrochureDownload = () => {
    if (!company?._id) {
      console.error("Company ID not available yet");
      return;
    }
    window.open(`/api/brochure/${company._id}`, "_blank");
  };

  const isLoading = isLoadingCompany || isLoadingProducts;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FFFFFF] text-gray-900 font-serif">
      <VerticalMenu />

      <div className="flex-1 w-full mt-8 flex flex-col border border-gray-300 md:ml-10 bg-white rounded-lg shadow-md overflow-y-auto">
        {/* Header – styled like Company header */}
        <div className="h-20 w-full flex flex-col sm:flex-row justify-between items-center px-8 border-b border-gray-300 bg-gray-100 rounded-t-lg">
          <div className="flex-1">
            <div className="font-bold text-3xl tracking-wide">
              {company?.company_name || (isLoading ? "Loading..." : "Company")}
            </div>
            {company?.company_email && (
              <div className="text-sm text-gray-600 mt-1">
                {company.company_email}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-3 sm:mt-0">
            <button
              onClick={handleBrochureDownload}
              disabled={!company?._id}
              className="h-10 w-full sm:w-56 border border-gray-700 bg-gray-300 hover:bg-gray-200 rounded-md text-gray-800 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Download Brochure
            </button>
            <button
              className="h-10 w-full sm:w-48 bg-gray-200 hover:bg-gray-300 rounded-md border border-gray-500 text-gray-700 font-semibold transition-colors"
              onClick={() => setShowForm(true)}
            >
              + Add Product
            </button>
          </div>
        </div>

        {/* Loading / Error */}
        {isLoading && (
          <div className="mt-4 px-8 text-gray-700 italic">Loading data...</div>
        )}
        {(errorCompany || errorProducts) && (
          <div className="mt-4 mx-8 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
            {errorCompany && <p>{errorCompany}</p>}
            {errorProducts && <p>{errorProducts}</p>}
          </div>
        )}

        {/* Stat Cards – similar style */}
        <div className="w-[95%] mx-auto mt-6 flex flex-wrap gap-6 justify-start">
          <SummaryCard
            label="Products"
            value={products.length}
          />
          <SummaryCard
            label="Categories"
            value={
              new Set(products.map((p) => p.category || "Uncategorized")).size
            }
          />
          <SummaryCard
            label="Search Results"
            value={filteredProducts.length}
          />
        </div>

        {/* Company Info */}
        <div className="w-[95%] mx-auto mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
          <div className="p-4 border rounded-xl shadow-sm bg-gray-50 space-y-2">
            <InfoRow label="Phone" value={company?.company_phone_number} />
            <InfoRow label="E-Mail" value={company?.company_email} />
            <InfoRow label="Address" value={company?.company_address} />
          </div>

          <div className="p-4 border rounded-xl shadow-sm bg-gray-50">
            <div className="font-bold text-gray-800 mb-2">About</div>
            <div className="text-sm text-gray-600 leading-relaxed">
              {company?.about_company ||
                "No description available for this company yet."}
            </div>
          </div>
        </div>

        {/* Product Table Section – styled like Company table section */}
        <div className="flex-1 w-[95%] mx-auto mt-2 rounded-b-lg border border-t-0 border-gray-300 bg-white shadow-sm pb-8 mb-8">
          {/* Toolbar */}
          <div className="py-4 w-full flex flex-col lg:flex-row justify-between gap-4 px-4 text-center">
            <div className="text-left">
              <h1 className="font-bold text-2xl sm:text-3xl text-gray-800">
                Product List
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage and browse all products for this company.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search products by name, category, price..."
                className="h-10 w-full sm:w-64 border border-gray-400 rounded-md text-gray-700 placeholder-gray-500 px-3 focus:outline-none focus:ring-1 focus:ring-gray-500"
              />
            </div>
          </div>

          {/* Table */}
          <ProductTable
            products={paginatedProducts}
            startIndex={startIndex}
            isLoading={isLoadingProducts}
            totalProducts={filteredProducts.length}
          />

          {/* Pagination */}
          {filteredProducts.length > 0 && (
            <Pagination
              currentPage={currentPageSafe}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>

      {/* Popup Form */}
      {showForm && (
        <ProductPopupForm
          Close={() => setShowForm(false)}
          data={id}
          refreshProducts={fetchProducts}
          exid={company?.createdBy}
        />
      )}
    </div>
  );
}

/* ----------------- SUBCOMPONENTS ----------------- */

function SummaryCard({ label, value }) {
  return (
    <div className="h-24 w-48 rounded-xl flex flex-col justify-center items-center bg-white border border-gray-300 shadow-sm">
      <div className="text-center text-lg font-medium text-gray-700">
        {label}
      </div>
      <div className="text-4xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <p className="text-sm text-gray-700">
      <span className="font-semibold">{label}:</span>{" "}
      <span className="text-gray-800">{value || "N/A"}</span>
    </p>
  );
}

function ProductTable({ products, startIndex, isLoading, totalProducts }) {
  if (isLoading && totalProducts === 0) {
    return (
      <div className="mt-6 text-center text-gray-600 italic">
        Loading products...
      </div>
    );
  }

  if (!isLoading && products.length === 0) {
    return (
      <div className="mt-6 text-center text-gray-600 italic">
        No products found.
      </div>
    );
  }

  return (
    <div className="flex-1 w-full overflow-x-auto text-left mt-6 px-4">
      <table className="w-full min-w-[700px] border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200 text-gray-800 border-b border-gray-300">
            <th className="px-4 py-3 border-r border-gray-300">#</th>
            <th className="px-4 py-3 border-r border-gray-300">Product Name</th>
            <th className="px-4 py-3 border-r border-gray-300">Category</th>
            <th className="px-4 py-3 border-r border-gray-300">Price</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((item, index) => (
            <tr
              key={item._id || index}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <td className="px-4 py-3 border border-gray-300">
                {startIndex + index + 1}
              </td>
              <td className="px-4 py-3 border border-gray-300">
                {item.product_name || "-"}
              </td>
              <td className="px-4 py-3 border border-gray-300">
                {item.category || "-"}
              </td>
              <td className="px-4 py-3 border border-gray-300">
                {item.price != null ? item.price : "-"}
              </td>
              <td className="px-4 py-3 border border-gray-300">
                <div className="flex flex-wrap gap-2">
                  <button className="px-3 py-1 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-colors text-sm">
                    View
                  </button>
                  <button className="px-3 py-1 border border-gray-600 text-gray-700 rounded-md hover:bg-gray-700 hover:text-white transition-colors text-sm">
                    Edit
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  const handlePrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };
  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex justify-center gap-4 items-center">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
      >
        Previous
      </button>
      <span className="text-gray-700 font-semibold">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
