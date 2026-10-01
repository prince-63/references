import type { UserProfile, AllServiceItem, ServiceProduct } from '@/lib/types';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useEnvironment } from '@/lib/EnvironmentContext';
import { logger } from '@/lib/logger';

interface ServiceConfigSectionProps {
  user: UserProfile;
  readOnly?: boolean;
  onServiceItemsChange?: (serviceItemIds: number[]) => void;
  onProductsChange?: (changes: {
    productsToAdd: string[];
    productsToDelete: number[];
  }) => void;
}

export default function ServiceConfigSection({
  user,
  readOnly = false,
  onServiceItemsChange,
  onProductsChange,
}: ServiceConfigSectionProps) {
  const { environment } = useEnvironment();
  const [allServiceItems, setAllServiceItems] = useState<AllServiceItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [serviceProducts, setServiceProducts] = useState<ServiceProduct[]>([]);
  const [brokenImageIds, setBrokenImageIds] = useState<number[]>([]);
  const [productsToAdd, setProductsToAdd] = useState<string[]>([]);
  const [productsToDelete, setProductsToDelete] = useState<number[]>([]);

  const isEditable = !readOnly && user.service_config_id;

  useEffect(() => {
    const fetchAllServiceItems = async () => {
      try {
        logger.info('Fetching service items and products', {
          profileId: user.profile_id,
          environment,
        });
        const response = await fetch(
          `/api/service-items?environment=${environment}&profile_id=${user.profile_id}`
        );
        const data = await response.json();
        setAllServiceItems(data.data || []);

        const products = data.profile?.service_products;
        if (Array.isArray(products)) {
          logger.debug('Service products loaded', {
            count: products.length,
            profileId: user.profile_id,
          });
          setServiceProducts(products);
        } else {
          logger.debug('No service products found', {
            profileId: user.profile_id,
          });
          setServiceProducts([]);
        }
      } catch (error) {
        logger.error('Failed to fetch service items', {
          error,
          profileId: user.profile_id,
        });
        setServiceProducts([]);
      }
    };

    fetchAllServiceItems();
  }, [environment, user.profile_id]);

  useEffect(() => {
    const initItems = () => {
      let currentItems: number[] = [];

      if (user.service_items) {
        try {
          const items =
            typeof user.service_items === 'string'
              ? JSON.parse(user.service_items)
              : user.service_items;

          if (Array.isArray(items) && items.length > 0) {
            currentItems = items
              .filter(
                (item: unknown) =>
                  item && (item as Record<string, unknown>).service_item_id
              )
              .map((item: unknown) =>
                Number((item as Record<string, unknown>).service_item_id)
              );
          }
        } catch (error) {
          console.error('Failed to parse service items:', error);
        }
      }

      return currentItems;
    };

    const items = initItems();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedItems(items);
  }, [user.service_items, user.profile_id]);

  const handleToggleItem = (itemId: number) => {
    if (!isEditable) return;

    setSelectedItems((prev) => {
      const newItems = prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId];

      logger.debug('Service item toggled', {
        itemId,
        selected: !prev.includes(itemId),
        profileId: user.profile_id,
      });
      setTimeout(() => onServiceItemsChange?.(newItems), 0);

      return newItems;
    });
  };

  const handleAddProduct = (
    template: 'PLANNING' | 'MANUFACTURING' | 'PLANNING_MANUFACTURING'
  ) => {
    logger.info('Adding service product', {
      template,
      profileId: user.profile_id,
    });
    setProductsToAdd((prev) => {
      const updated = [...prev, template];
      setTimeout(
        () => onProductsChange?.({ productsToAdd: updated, productsToDelete }),
        0
      );
      return updated;
    });
  };

  const handleDeleteProduct = (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    logger.info('Marking product for deletion', {
      productId,
      profileId: user.profile_id,
    });
    setProductsToDelete((prev) => {
      const updated = [...prev, productId];
      setTimeout(
        () => onProductsChange?.({ productsToAdd, productsToDelete: updated }),
        0
      );
      return updated;
    });
  };

  if (!user.service_config_id && readOnly) {
    return null;
  }

  return (
    <section>
      <h3 className="text-sm font-semibold text-gray-900 mb-4 px-4 sm:px-6 pb-2 border-b border-gray-200">
        Service Configuration
      </h3>
      <div className="px-4 sm:px-6 space-y-4">
        {!user.service_config_id && (
          <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-3">
            No service configuration exists for this profile. Service items
            cannot be updated.
          </div>
        )}

        {user.service_config_id && (
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Service Config ID
            </label>
            <div className="text-sm text-gray-900 mt-1 font-mono">
              {user.service_config_id}
            </div>
          </div>
        )}

        {user.service_config_id && (
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-3">
              {readOnly ? 'Configured Service Items' : 'Select Service Items'}
            </label>

            {allServiceItems.length === 0 ? (
              <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg">
                Loading service items...
              </div>
            ) : readOnly && selectedItems.length === 0 ? (
              <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg">
                No service items configured
              </div>
            ) : (
              <div className="space-y-2">
                {allServiceItems.map((item) => {
                  const isSelected = selectedItems.includes(Number(item.id));

                  if (readOnly && !isSelected) return null;

                  return (
                    <label
                      key={item.id}
                      className={`flex items-center p-3 border rounded-md transition-colors ${
                        isEditable ? 'cursor-pointer' : 'cursor-default'
                      } ${
                        isSelected
                          ? 'border-[#735bf2] bg-[#735bf2]/5'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleItem(Number(item.id))}
                        disabled={!isEditable}
                        className="w-4 h-4 text-[#735bf2] border-gray-300 rounded focus:ring-[#735bf2] disabled:cursor-not-allowed"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900">
                        {item.item_name}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Service Products
            </label>
            {!readOnly && (
              <div className="relative w-full sm:w-auto">
                <select
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value) {
                      handleAddProduct(
                        value as
                          | 'PLANNING'
                          | 'MANUFACTURING'
                          | 'PLANNING_MANUFACTURING'
                      );
                      e.target.value = '';
                    }
                  }}
                  className="w-full sm:w-auto text-xs px-3 py-1.5 border border-[#735bf2] text-[#735bf2] rounded-md hover:bg-[#735bf2]/5 transition-colors"
                >
                  <option value="">+ Add Product</option>
                  <option value="PLANNING">Expert Aligner Planning</option>
                  <option value="MANUFACTURING">White Labelled Aligners</option>
                  <option value="PLANNING_MANUFACTURING">
                    Aligners (Planning + Manufacturing)
                  </option>
                </select>
              </div>
            )}
          </div>

          {serviceProducts.length === 0 && productsToAdd.length === 0 ? (
            <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg">
              No service products configured
            </div>
          ) : (
            <div className="space-y-2">
              {serviceProducts.map((product) => {
                const isPendingDelete = productsToDelete.includes(product.id);
                return (
                  <div
                    key={product.id}
                    className={`p-3 border rounded-md ${isPendingDelete ? 'border-red-300 bg-red-50 opacity-60' : 'border-gray-300 bg-white'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 shrink-0 rounded-md border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
                        {product.product_image &&
                        !brokenImageIds.includes(product.id) ? (
                          <Image
                            src={product.product_image}
                            alt={
                              product.product_name || `Product ${product.id}`
                            }
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                            onError={() => {
                              setBrokenImageIds((prev) =>
                                prev.includes(product.id)
                                  ? prev
                                  : [...prev, product.id]
                              );
                            }}
                          />
                        ) : (
                          <span className="text-[10px] font-medium text-gray-400">
                            No Image
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                          <span
                            className={`text-sm font-medium wrap-break-word ${isPendingDelete ? 'text-gray-500 line-through' : 'text-gray-900'}`}
                          >
                            {product.product_name || `Product #${product.id}`}
                          </span>
                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            {isPendingDelete ? (
                              <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700">
                                To be deleted
                              </span>
                            ) : (
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${product.is_product_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                              >
                                {product.is_product_enabled
                                  ? 'Enabled'
                                  : 'Disabled'}
                              </span>
                            )}
                            {!readOnly &&
                              (isPendingDelete ? (
                                <button
                                  onClick={() => {
                                    setProductsToDelete((prev) => {
                                      const updated = prev.filter(
                                        (id) => id !== product.id
                                      );
                                      setTimeout(
                                        () =>
                                          onProductsChange?.({
                                            productsToAdd,
                                            productsToDelete: updated,
                                          }),
                                        0
                                      );
                                      return updated;
                                    });
                                  }}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50 p-1 rounded transition-colors"
                                  title="Undo delete"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                    />
                                  </svg>
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleDeleteProduct(product.id)
                                  }
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                                  title="Delete product"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              ))}
                          </div>
                        </div>
                        <div className="mt-1 text-xs text-gray-600 wrap-break-word">
                          {product.product_type || 'Unknown Type'}
                          {product.category_name
                            ? ` • ${product.category_name}`
                            : ''}
                        </div>
                        {product.product_description && (
                          <div className="mt-1 text-xs text-gray-500 wrap-break-word">
                            {product.product_description}
                          </div>
                        )}
                        {isPendingDelete && (
                          <div className="mt-1 text-xs text-red-600">
                            Will be deleted when you save changes
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {productsToAdd.map((template, idx) => {
                const templates = {
                  PLANNING: {
                    name: 'Expert Aligner Planning',
                    type: 'SERVICE',
                  },
                  MANUFACTURING: {
                    name: 'White Labelled Aligners',
                    type: 'MANUFACTURING_SERVICE',
                  },
                  PLANNING_MANUFACTURING: { name: 'Aligners', type: 'ALIGNER' },
                };
                const info = templates[template as keyof typeof templates];
                return (
                  <div
                    key={`new-${idx}`}
                    className="p-3 border border-green-300 bg-green-50 rounded-md"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 shrink-0 rounded-md border border-green-200 bg-white overflow-hidden flex items-center justify-center">
                        <span className="text-[10px] font-medium text-green-600">
                          Pending
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {info.name}
                          </span>
                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
                              To be added
                            </span>
                            <button
                              onClick={() => {
                                setProductsToAdd((prev) => {
                                  const updated = prev.filter(
                                    (_, i) => i !== idx
                                  );
                                  setTimeout(
                                    () =>
                                      onProductsChange?.({
                                        productsToAdd: updated,
                                        productsToDelete,
                                      }),
                                    0
                                  );
                                  return updated;
                                });
                              }}
                              className="text-gray-600 hover:text-gray-700 hover:bg-gray-100 p-1 rounded transition-colors"
                              title="Cancel adding"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="mt-1 text-xs text-gray-600">
                          {info.type}
                        </div>
                        <div className="mt-1 text-xs text-green-600">
                          Will be added when you save changes
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
