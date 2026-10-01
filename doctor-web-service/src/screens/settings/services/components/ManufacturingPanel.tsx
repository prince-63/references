import React from 'react'
import {Formik, FormikHelpers} from 'formik'
import FormikInput from 'components/atom/Inputs/FormikInput'
import type {Product} from './types'

type Props = {
  manufacturingProducts: Product[]
  showAddProduct: boolean
  onAddAction: () => void
  newProduct: {name: string; category: string; description: string; photo: string}
  setNewProduct: (p: any) => void
  // setNewProduct removed (not needed here)
  handleNewProductFile: (f?: File) => void
  editingProduct: {type: 'aligner' | 'planning' | 'manufacturing'; id: string} | null
  editingProductData: {name: string; category: string; description: string; photo: string}
  startEditProduct: (type: 'aligner' | 'planning' | 'manufacturing', p: Product) => void
  handleEditProductFile: (f?: File) => void
  saveEditedProduct: (values?: {
    name: string
    category: string
    description: string
    photo: string
  }) => void
  deleteProduct: (type: 'aligner' | 'planning' | 'manufacturing', id: string) => void
  addProduct: (
    categoryOverride?:
      | string
      | {name: string; category: string; description: string; photo: string},
    target?: 'aligner' | 'planning' | 'manufacturing'
  ) => void
}

const ManufacturingPanel: React.FC<Props> = ({
  manufacturingProducts,
  showAddProduct,
  onAddAction,
  newProduct,
  setNewProduct,
  handleNewProductFile,
  editingProduct,
  editingProductData,
  startEditProduct,
  handleEditProductFile,
  saveEditedProduct,
  deleteProduct,
  addProduct,
}) => {
  // reference some props to avoid 'defined but never used' TS diagnostics
  void editingProduct
  void editingProductData
  void handleEditProductFile
  void saveEditedProduct
  void setNewProduct
  return (
    <section className='bg-white border rounded-lg p-4'>
      <div className='flex items-center justify-between mb-3'>
        <h3 className='font-semibold'>Products</h3>
        <button onClick={onAddAction} className='px-3 py-1 bg-primaryColor text-white rounded'>
          {showAddProduct ? 'Save' : 'Add Product'}
        </button>
      </div>

      {showAddProduct && (
        <div className='p-3 border rounded bg-gray-50 mb-3'>
          {/* Use Formik to manage the add-product form similar to AddLabs pattern */}
          <Formik
            initialValues={newProduct}
            onSubmit={(
              values: {name: string; category: string; description: string; photo: string},
              formik: FormikHelpers<{
                name: string
                category: string
                description: string
                photo: string
              }>
            ) => {
              addProduct(values, 'manufacturing')
              formik.resetForm()
            }}
          >
            {(formik: any) => (
              <form onSubmit={formik.handleSubmit}>
                <div className='grid md:grid-cols-2 gap-2'>
                  <FormikInput
                    name='category'
                    placeholder='Category'
                    value={formik.values.category}
                    onChange={formik.handleChange}
                    className='border p-2 rounded'
                  />
                  <FormikInput
                    name='name'
                    placeholder='Product name'
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    className='border p-2 rounded'
                  />
                </div>
                <div className='mt-2'>
                  <input
                    type='file'
                    accept='image/*'
                    onChange={(e) => {
                      handleNewProductFile(e.target.files?.[0])
                      // Also set the base64 into formik so preview/update works
                      const f = e.target.files?.[0]
                      if (!f) return
                      const reader = new FileReader()
                      reader.onload = () => {
                        formik.setFieldValue('photo', String(reader.result))
                      }
                      reader.readAsDataURL(f)
                    }}
                    className='w-full'
                  />
                </div>
                <div className='mt-2'>
                  <FormikInput
                    name='description'
                    placeholder='Description'
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    className='w-full border p-2 rounded mt-2'
                  />
                </div>
                <div className='flex justify-end space-x-2 mt-2'>
                  <button
                    type='button'
                    onClick={() => {
                      formik.resetForm()
                      if (typeof onAddAction === 'function') onAddAction()
                    }}
                    className='px-3 py-1 border rounded'
                  >
                    Cancel
                  </button>
                  <button type='submit' className='px-3 py-1 bg-primary-600 text-white rounded'>
                    Save
                  </button>
                </div>
              </form>
            )}
          </Formik>
        </div>
      )}

      <div className='space-y-3'>
        {manufacturingProducts.map((prod) => (
          <div key={prod.id} className='p-3 border rounded bg-white'>
            <div className='flex items-start justify-between'>
              <div>
                <div className='font-medium'>{prod.name}</div>
                <div className='text-sm text-gray-600'>{prod.description}</div>
                {prod.photo && (
                  <img
                    src={prod.photo}
                    alt={prod.name}
                    className='mt-2 w-24 h-24 object-cover rounded'
                  />
                )}
              </div>
              <div className='flex flex-col items-end space-y-2'>
                <div className='text-sm text-gray-500'>
                  Created {new Date(prod.createdAt).toLocaleDateString()}
                </div>
                <div className='flex space-x-2'>
                  <button
                    onClick={() => startEditProduct('manufacturing', prod)}
                    className='px-2 py-1 border rounded'
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteProduct('manufacturing', prod.id)}
                    className='px-2 py-1 border rounded text-red-600'
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {manufacturingProducts.length === 0 && (
          <div className='text-gray-500'>No products configured</div>
        )}
      </div>
    </section>
  )
}

export default ManufacturingPanel
