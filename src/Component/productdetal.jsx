import { useEffect, useState } from "react";
import VerticalMenu from "./menu";
import { useParams, useNavigate } from "react-router-dom";

function ProductDisplay() {
  const [product, setProduct] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/product/detail/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data))
      .catch((err) => console.error(err));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/product/delete/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Product deleted successfully");
        navigate("/products");
      } else {
        alert("Delete failed");
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-medium">Loading product...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100 text-gray-900 font-serif">
      {/* Sidebar */}
      <VerticalMenu />

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-8">

          {/* Product Name */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-500 mb-1">
              Product Name
            </p>
            <h1 className="text-3xl font-bold">
              {product.product_name}
            </h1>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

            {/* Image (No Label) */}
            <div className="flex justify-center">
              <img
                src={product.product_url}
                alt={product.product_name}
                className="w-full max-w-md h-96 object-cover rounded-xl border shadow-sm"
              />
            </div>

            {/* Product Details with Labels */}
            <div className="space-y-6">

              {/* Category */}
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">
                  Category
                </p>
                <span className="inline-block px-4 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
                  {product.category}
                </span>
              </div>

              {/* Price */}
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">
                  Price
                </p>
                <span className="text-2xl font-bold text-gray-900">
                  ₹ {product.price}
                </span>
              </div>

              {/* Description */}
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">
                  Product Description
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {product.details}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <button className="px-8 py-3 bg-black text-white text-lg font-semibold rounded-lg hover:bg-gray-800 transition">
                  Buy Now
                </button>

                <button
                  onClick={handleDelete}
                  className="px-8 py-3 bg-red-600 text-white text-lg font-semibold rounded-lg hover:bg-red-700 transition"
                >
                  Delete Product
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ProductDisplay;
