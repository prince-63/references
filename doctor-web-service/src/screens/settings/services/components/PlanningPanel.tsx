import React from 'react'
import type {Product, Plan} from './types'

type Props = {
  planningEnabled: boolean
  showAddProduct: boolean
  showAddPlan: boolean
  newProduct: {name: string; category: string; description: string; photo: string}
  setNewProduct: (p: any) => void
  handleNewProductFile: (f?: File) => void
  planningProducts: Product[]
  planningPlans: Plan[]
  addProduct: (
    categoryOverride?:
      | string
      | {name: string; category: string; description: string; photo: string},
    target?: 'aligner' | 'planning' | 'manufacturing'
  ) => void
  addPlan: () => void
  startEditProduct: (type: 'aligner' | 'planning' | 'manufacturing', p: Product) => void
  deleteProduct: (type: 'aligner' | 'planning' | 'manufacturing', id: string) => void
  editingProduct?: {type: 'aligner' | 'planning' | 'manufacturing'; id: string} | null
  editingProductData?: {name: string; category: string; description: string; photo: string}
  saveEditedProduct?: (values?: {
    name: string
    category: string
    description: string
    photo: string
  }) => void
}

const PlanningPanel: React.FC<Props> = ({
  planningEnabled,
  showAddProduct,
  showAddPlan,
  newProduct,
  setNewProduct,
  handleNewProductFile,
  planningProducts,
  planningPlans,
  addProduct,
  addPlan,
  startEditProduct,
  deleteProduct,
}) => {
  return (
    <section className='bg-white border rounded-lg p-4'>
      <div className='flex items-center justify-between mb-3'>
        <h3 className='font-semibold'>Planning Services</h3>
        <div className='flex items-center space-x-2'>
          <button onClick={() => {}} className='px-3 py-1 bg-primaryColor text-white rounded'>
            {showAddProduct ? 'Save' : 'Add Product'}
          </button>
        </div>
      </div>
      {!planningEnabled ? (
        <div className='p-3 bg-yellow-50 border rounded'>
          Planning services are disabled. Enable them in Overview to manage plans.
        </div>
      ) : (
        <div className='space-y-3'>
          {showAddPlan && (
            <div className='p-3 border rounded bg-gray-50'>
              <div className='grid md:grid-cols-2 gap-2'>
                <input
                  placeholder='Plan name'
                  value={''}
                  onChange={() => {}}
                  className='border p-2 rounded'
                />
                <input
                  type='number'
                  placeholder='Price'
                  value={0}
                  onChange={() => {}}
                  className='border p-2 rounded'
                />
              </div>
              <textarea
                placeholder='Description'
                value={''}
                onChange={() => {}}
                className='w-full border p-2 rounded mt-2'
              />
              <div className='flex justify-end space-x-2 mt-2'>
                <button onClick={() => {}} className='px-3 py-1 border rounded'>
                  Cancel
                </button>
                <button onClick={addPlan} className='px-3 py-1 bg-primary-600 text-white rounded'>
                  Add Plan
                </button>
              </div>
            </div>
          )}

          {showAddProduct && (
            <div className='p-3 border rounded bg-gray-50 mb-3'>
              <div className='grid md:grid-cols-2 gap-2'>
                <input
                  value={newProduct.category}
                  onChange={(e) =>
                    setNewProduct((prev: any) => ({...prev, category: e.target.value}))
                  }
                  placeholder='Category'
                  className='border p-2 rounded'
                />
                <input
                  placeholder='Product name'
                  value={newProduct.name}
                  onChange={(e) => setNewProduct((prev: any) => ({...prev, name: e.target.value}))}
                  className='border p-2 rounded'
                />
              </div>
              <input
                type='file'
                accept='image/*'
                onChange={(e) => handleNewProductFile(e.target.files?.[0])}
                className='w-full mt-2'
              />
              <textarea
                placeholder='Description'
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct((prev: any) => ({...prev, description: e.target.value}))
                }
                className='w-full border p-2 rounded mt-2'
              />
              <div className='flex justify-end space-x-2 mt-2'>
                <button onClick={() => {}} className='px-3 py-1 border rounded'>
                  Cancel
                </button>
                <button
                  onClick={() => addProduct(undefined, 'planning')}
                  className='px-3 py-1 bg-primary-600 text-white rounded'
                >
                  Save
                </button>
              </div>
            </div>
          )}

          <div className='space-y-2'>
            {planningProducts.map((prod) => (
              <div key={prod.id} className='p-3 border rounded bg-white'>
                <div className='flex items-start justify-between'>
                  <div>
                    <div className='font-medium'>{prod.name}</div>
                    <div className='text-sm text-gray-600'>{prod.description}</div>
                  </div>
                  <div className='flex flex-col items-end space-y-2'>
                    <div className='text-sm text-gray-500'>
                      Created {new Date(prod.createdAt).toLocaleDateString()}
                    </div>
                    <div className='flex space-x-2'>
                      <button
                        onClick={() => startEditProduct('planning', prod)}
                        className='px-2 py-1 border rounded'
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProduct('planning', prod.id)}
                        className='px-2 py-1 border rounded text-red-600'
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {planningProducts.length === 0 && (
              <div className='text-gray-500'>No planning products configured</div>
            )}
          </div>

          <div className='space-y-2'>
            {planningPlans.map((p) => (
              <div key={p.id} className='p-3 border rounded bg-white'>
                <div className='flex justify-between'>
                  <div>
                    <div className='font-medium'>{p.name}</div>
                    <div className='text-sm text-gray-600'>
                      ${p.price} — {p.description}
                    </div>
                  </div>
                  <div className='text-sm text-gray-500'>
                    Created {new Date(p.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default PlanningPanel
