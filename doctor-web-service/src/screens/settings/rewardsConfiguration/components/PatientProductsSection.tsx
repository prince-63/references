import {useState, useEffect, useContext} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import {safeParseInt} from 'utils/ConstFunctions'
import {
  createRewardProduct,
  getRewardProducts,
  updateRewardProduct,
} from 'redux/Slices/AppSlice/rewards/rewards.slice'
import ContainerWrapper from 'screens/settings/components/ContainerWrapper'
import {Modal, Switch, InputNumber, Input, Upload} from 'antd'
import {DefaultImage} from 'assets/images/Images/DefaultImage'
import VisibleEditButton from 'components/atom/Buttons/VisibleEditButton'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {PlusOutlined} from '@ant-design/icons'
import type {RcFile, UploadFile, UploadProps} from 'antd/es/upload/interface'

interface ProductItem {
  id: number
  name: string
  product_name?: string
  description?: string
  product_description?: string
  emoji?: string
  coins_required: number
  monetary_value?: number
  inventory_count?: number
  status?: string
  is_available: boolean
  image?: string
  image_url?: string
  category?: string
  display_order?: number
  is_featured?: boolean
  low_stock_threshold?: number
  terms_and_conditions?: string
  created_at?: string
  updated_at?: string
}

const PatientProductsSection = () => {
  const {profileId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()

  // Get products from Redux state
  const {products: reduxProducts} = useSelector((state: RootState) => state.rewards)
  const [products, setProducts] = useState<ProductItem[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    coins_required: 0,
    monetary_value: 0,
    terms_and_conditions: '',
    display_order: 0,
    is_featured: false,
    low_stock_threshold: 0,
    is_available: true,
  })
  const [fileList, setFileList] = useState<UploadFile[]>([])

  // Sync Redux products to local state
  useEffect(() => {
    if (reduxProducts && reduxProducts.length > 0) {
      // Map API response to local ProductItem format
      const mappedProducts = reduxProducts.map((product: any) => ({
        id: product.id,
        name: product.product_name || product.name || '',
        description: product.product_description || product.description || '',
        emoji: product.emoji || '🎁',
        coins_required: product.coin_cost || product.coins_required || 0,
        monetary_value: product.monetary_value || 0,
        terms_and_conditions: product.terms_and_conditions || '',
        display_order: product.display_order || 0,
        is_featured: product.is_featured || false,
        low_stock_threshold: product.low_stock_threshold || 0,
        is_available: product.status === 'IN_STOCK' || product.is_available || false,
        image: product.image_url || product.image,
        category: product.category,
        inventory_count: product.inventory_count,
      }))
      setProducts(mappedProducts)
    }
  }, [reduxProducts])

  const openAddModal = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      description: '',
      coins_required: 0,
      monetary_value: 0,
      terms_and_conditions: '',
      display_order: 0,
      is_featured: false,
      low_stock_threshold: 0,
      is_available: true,
    })
    setFileList([])
    setIsModalOpen(true)
  }

  const openEditModal = (product: ProductItem) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      coins_required: product.coins_required,
      monetary_value: product.monetary_value || 0,
      terms_and_conditions: product.terms_and_conditions || '',
      display_order: product.display_order || 0,
      is_featured: product.is_featured || false,
      low_stock_threshold: product.low_stock_threshold || 0,
      is_available: product.is_available,
    })

    if (product.image) {
      setFileList([
        {
          uid: '-1',
          name: 'image.png',
          status: 'done',
          url: product.image,
        },
      ])
    } else {
      setFileList([])
    }

    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!profileId) {
      ErrorToast('User not authenticated')
      return
    }

    const doctorId = safeParseInt(profileId)

    // Get the actual file from fileList
    const imageFile =
      fileList.length > 0 && fileList[0].originFileObj ? fileList[0].originFileObj : null

    if (editingProduct) {
      // Update existing product via API
      try {
        await dispatchAction(
          updateRewardProduct({
            product_id: editingProduct.id,
            doctor_id: doctorId,
            name: formData.name,
            description: formData.description,
            coins_required: formData.coins_required,
            monetary_value: formData.monetary_value,
            terms_and_conditions: formData.terms_and_conditions,
            display_order: formData.display_order,
            is_featured: formData.is_featured,
            low_stock_threshold: formData.low_stock_threshold,
            is_available: formData.is_available,
            image: imageFile,
          })
        )
          .then(() => {
            dispatchAction(getRewardProducts())
          })
          .then(() => {
            SuccessToast('Product updated successfully')
          })
      } catch (error) {
        ErrorToast('Failed to update product')
        return
      }
    } else {
      // Create new product via API
      try {
        await dispatchAction(
          createRewardProduct({
            doctor_id: doctorId,
            name: formData.name,
            description: formData.description,
            coins_required: formData.coins_required,
            monetary_value: formData.monetary_value,
            terms_and_conditions: formData.terms_and_conditions,
            display_order: formData.display_order,
            is_featured: !formData.is_featured,
            low_stock_threshold: formData.low_stock_threshold,
            is_available: formData.is_available,
            image: imageFile,
          })
        )
          .then(() => {
            dispatchAction(getRewardProducts())
          })
          .then(() => {
            SuccessToast('Product created successfully')
          })
      } catch (error) {
        ErrorToast('Failed to create product')
        return
      }
    }

    setIsModalOpen(false)
    setEditingProduct(null)
  }

  const handleToggleFeatured = async (productId: number) => {
    if (!profileId) return

    const product = products.find((p) => p.id === productId)
    if (!product) return

    const newFeaturedState = !product.is_featured
    const doctorId = safeParseInt(profileId)
    const imageFile =
      fileList.length > 0 && fileList[0].originFileObj ? fileList[0].originFileObj : null

    try {
      await dispatchAction(
        updateRewardProduct({
          product_id: productId,
          doctor_id: doctorId,
          name: product.name,
          description: product.description,
          coins_required: product.coins_required,
          monetary_value: product.monetary_value,
          terms_and_conditions: product.terms_and_conditions,
          display_order: product.display_order,
          is_featured: newFeaturedState,
          low_stock_threshold: product.low_stock_threshold,
          is_available: product.is_available,
          image: imageFile,
        })
      )
        .unwrap()
        .then(() => {
          dispatchAction(getRewardProducts())
        })
    } catch (error) {
      ErrorToast(`Failed to update product featured status`)
    }
  }

  const onPreview = async (file: UploadFile) => {
    let src = file.url as string
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.readAsDataURL(file.originFileObj as RcFile)
        reader.onload = () => resolve(reader.result as string)
      })
    }
    const image = new Image()
    image.src = src
    const imgWindow = window.open(src)
    imgWindow?.document.write(image.outerHTML)
  }

  const handleChange: UploadProps['onChange'] = ({fileList: newFileList}) =>
    setFileList(newFileList)

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{marginTop: 8}}>Upload</div>
    </div>
  )

  return (
    <ContainerWrapper title='Reward Products' subTitle=''>
      <div className='mb-4 flex justify-end'>
        <AntdButton
          text='+ Add New Product'
          className='bg-primaryColor text-white hover:!bg-primaryColor/90 h-9 px-4'
          onClick={openAddModal}
        />
      </div>

      {/* Product Table */}
      <div className='overflow-x-auto'>
        <table className='w-full border-collapse'>
          <thead>
            <tr className='bg-gray-50'>
              <th className='text-left p-3 border-b-2 border-gray-200 font-semibold'>Product</th>
              <th className='text-center p-3 border-b-2 border-gray-200 font-semibold'>Enabled</th>
              <th className='text-center p-3 border-b-2 border-gray-200 font-semibold'>
                Coin Value
              </th>
              <th className='text-center p-3 border-b-2 border-gray-200 font-semibold'>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} className='text-center p-8 text-gray-500'>
                  No products configured. Click "+ Add New Product" to create one.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className='hover:bg-gray-50 border-b border-gray-100 group'>
                  <td className='p-3 font-semibold text-base flex items-center gap-4'>
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className='w-12 h-12 object-cover rounded-md border border-mediumGray'
                      />
                    ) : (
                      <DefaultImage
                        letter={(product.name && product.name[0]) || 'P'}
                        className='w-12 h-12 text-lg'
                      />
                    )}
                    <div className='text-base text-textColor'>{product.name}</div>
                  </td>
                  <td className='p-3 text-center'>
                    <Switch
                      checked={product.is_featured}
                      onChange={() => handleToggleFeatured(product.id)}
                      className={product.is_featured ? '!bg-green-500' : '!bg-gray-300'}
                    />
                  </td>
                  <td className='p-3 text-center'>
                    <InputNumber
                      min={0}
                      maxLength={3}
                      value={product.coins_required}
                      disabled
                      className='w-20 text-sm text-black font-bold !bg-white rounded-sm'
                    />
                  </td>
                  <td className='p-3 text-center'>
                    <div className='flex justify-center'>
                      <VisibleEditButton onClick={() => openEditModal(product)} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={
          <div className='flex justify-end gap-2'>
            <button
              onClick={() => setIsModalOpen(false)}
              className='px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50'
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className='px-4 py-2 bg-primaryColor text-white rounded-md hover:bg-primaryColor/90'
            >
              {editingProduct ? 'Save' : 'Create'}
            </button>
          </div>
        }
      >
        <div className='flex flex-col gap-4 py-4'>
          {/* Image Upload */}
          <div>
            <label className='block font-medium mb-2'>Product Image</label>
            <Upload
              listType='picture-card'
              fileList={fileList}
              onPreview={onPreview}
              onChange={handleChange}
              beforeUpload={() => false} // Prevent auto upload
              maxCount={1}
            >
              {fileList.length >= 1 ? null : uploadButton}
            </Upload>
          </div>

          <div>
            <label className='block font-medium mb-2'>Product Name *</label>
            <Input
              placeholder='e.g., Aligner Care Kit'
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className='block font-medium mb-2'>Coin Value *</label>
            <InputNumber
              min={0}
              maxLength={3}
              value={formData.coins_required}
              onChange={(value) => setFormData({...formData, coins_required: value || 0})}
              className='w-full'
            />
          </div>
        </div>
      </Modal>
    </ContainerWrapper>
  )
}

export default PatientProductsSection
