"use client";

import { useState } from "react";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import { useProducts } from "@/lib/hooks/useProducts";
import { CreateProductRequest } from "@/lib/services/products.service";
import { DashboardLayout } from "@/components/DashboardLayout";
import { IconPlus, IconPackage, IconEdit, IconTrash, IconCheck, IconX, IconCurrencyDollar, IconBox, IconEye, IconEyeOff } from '@tabler/icons-react';

function ProductForm({ 
  onSubmit, 
  loading, 
  initialData, 
  onCancel 
}: { 
  onSubmit: (data: CreateProductRequest) => void; 
  loading: boolean;
  initialData?: CreateProductRequest;
  onCancel?: () => void;
}) {
  const [formData, setFormData] = useState<CreateProductRequest>(
    initialData || {
      name: "",
      description: "",
      price: undefined,
      stock: 0,
      isActive: true,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">
          {initialData ? 'Edit Product' : 'Add New Product'}
        </h2>
        <p className="text-gray-600 mt-1">
          {initialData ? 'Update your product information' : 'Create a new product for your inventory'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Product Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter product name"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description || ""}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter product description"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Price ($)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IconCurrencyDollar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price || ""}
                onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full pl-10 pr-4 py-3 text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Stock Quantity
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IconBox className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                min="0"
                value={formData.stock || 0}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                className="w-full pl-10 pr-4 py-3 text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center p-4 bg-gray-50 rounded-xl">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <label className="ml-3 text-sm font-medium text-gray-700">
            Product is active (available for sale)
          </label>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <IconCheck className="w-4 h-4" />
            )}
            {loading ? "Saving..." : initialData ? "Update Product" : "Create Product"}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
            >
              <IconX className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default function ProductsPage() {
  const { loading: authLoading } = useRequireAuth();
  const { products, loading, createProduct, updateProduct, deleteProduct } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-purple-600 rounded-full animate-spin mx-auto" style={{ animationDelay: '-0.5s' }}></div>
          </div>
          <p className="text-gray-600 font-medium">Loading your products...</p>
        </div>
      </div>
    );
  }

  const handleCreateProduct = async (data: CreateProductRequest) => {
    try {
      await createProduct(data);
      setShowForm(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleUpdateProduct = async (data: CreateProductRequest) => {
    if (!editingProduct) return;
    
    try {
      await updateProduct(editingProduct.id, data);
      setEditingProduct(null);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(productId);
      } catch (error) {
        // Error handling is done in the hook
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-800 opacity-5 rounded-3xl"></div>
          <div className="relative p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                  Product Management 📦
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl">
                  Manage your inventory and product catalog. Add, edit, and organize your products for your AI assistant to sell.
                </p>
              </div>
              <div className="hidden lg:block">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <IconPackage className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600 font-medium">{products?.length || 0} total products</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
              <IconPackage className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {products?.length || 0} Products
              </span>
            </div>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            disabled={showForm || editingProduct}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <IconPlus className="w-4 h-4" />
            Add Product
          </button>
        </div>

        {/* Add/Edit Product Form */}
        {(showForm || editingProduct) && (
          <ProductForm
            onSubmit={showForm ? handleCreateProduct : handleUpdateProduct}
            loading={loading}
            initialData={editingProduct ? {
              name: editingProduct.name,
              description: editingProduct.description,
              price: editingProduct.price,
              stock: editingProduct.stock,
              isActive: editingProduct.isActive,
            } : undefined}
            onCancel={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
          />
        )}

        {/* Products List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">Your Products</h3>
            <p className="text-gray-600 mt-1">Manage your inventory and product catalog</p>
          </div>
          
          {loading && products.length === 0 ? (
            <div className="p-12 text-center">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-6"></div>
                <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-teal-600 rounded-full animate-spin mx-auto" style={{ animationDelay: '-0.5s' }}></div>
              </div>
              <p className="text-gray-600 font-medium">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-200 rounded-full mx-auto flex items-center justify-center shadow-lg mb-6">
                <IconPackage className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Products Yet</h3>
              <p className="text-gray-600 max-w-md mx-auto text-lg leading-relaxed mb-6">
                Start by adding your first product to your inventory. Your AI assistant will be able to sell these products to customers.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <IconPlus className="w-4 h-4 inline mr-2" />
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
                            <IconPackage className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{product.name}</div>
                            {product.description && (
                              <div className="text-sm text-gray-600 line-clamp-1">{product.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                                                 <div className="flex items-center gap-2 text-sm text-gray-900">
                           <IconCurrencyDollar className="w-4 h-4 text-gray-400" />
                           <span>{product.price ? `$${product.price}` : "Not set"}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <IconBox className="w-4 h-4 text-gray-400" />
                          <span className={`text-sm font-medium ${product.stock > 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {product.stock}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
                          product.isActive 
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-600' 
                            : 'bg-red-50 border border-red-200 text-red-600'
                        }`}>
                          {product.isActive ? <IconEye className="w-4 h-4" /> : <IconEyeOff className="w-4 h-4" />}
                          <span>{product.isActive ? "Active" : "Inactive"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setEditingProduct(product)}
                            disabled={showForm || editingProduct}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                            title="Edit product"
                          >
                            <IconEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={loading}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                            title="Delete product"
                          >
                            <IconTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
