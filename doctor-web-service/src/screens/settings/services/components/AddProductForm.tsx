import FormikInput from 'components/atom/Inputs/FormikInput'
import {Formik, FormikHelpers} from 'formik'
import {useContext, useMemo, useState} from 'react'
import getInitialValues from '../helpers/getInitialValues'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import FormikSelect from 'components/atom/Inputs/FormikSelect'
import {Upload, Button, Image, UploadFile, Modal, Switch, Spin, Progress} from 'antd'
import {InfoCircleOutlined} from '@ant-design/icons'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  addServiceProduct,
  editServiceProduct,
  setEditingProductData,
} from 'redux/Slices/UISlices/services.slice'
import type {RcFile, UploadChangeParam} from 'antd/es/upload'
import {safeParseInt} from 'utils/ConstFunctions'
import {AuthContext} from 'context/AuthContext'
import FormikInputTextArea from 'components/atom/Inputs/FormikInputTextArea'
import hasValue from 'utils/hasValue'
import AntdButton from 'components/atom/Buttons/AntdButton'
import clsx from 'clsx'
import addProductFormValidationSchema from '../helpers/addProductFormValidations'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import getColorPalette from 'utils/getColorPalette'

const MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024

const AddProductForm = ({
  refreshData,
  showAddProduct,
  setShowAddProduct,
}: {
  refreshData: (params: {
    search?: string
    product_type?: 'ALIGNER' | 'SERVICE' | 'MANUFACTURING_SERVICE'
  }) => void
  showAddProduct: boolean
  setShowAddProduct: (show: boolean) => void
}) => {
  const {profileId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {editingProductData} = useSelector((state: RootState) => state.uiServices)
  const [productImage, setProductImage] = useState(
    editingProductData ? editingProductData?.product_image : ''
  )
  const [productImageLoading, setProductImageLoading] = useState(false)
  const [productImageProgress, setProductImageProgress] = useState<number | null>(null)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const {categoryList} = useSelector((state: RootState) => state.uiServices)

  const platte = getColorPalette()

  const categoryListOptions = useMemo<{label: string; value: string; name: string}[]>(() => {
    if (!categoryList?.length) return []

    const productList = []
    const serviceList = []
    const manufacturingProduct = []
    const vspPlanningList = []

    for (const item of categoryList) {
      switch (item.label) {
        case 'ALIGNERS(PLANNING + MANUFACTURING)':
          productList.push(item)
          break
        case 'PLANNING':
          serviceList.push(item)
          break
        case 'ALIGNERS(MANUFACTURING)':
          manufacturingProduct.push(item)
          break
        case 'VSP PLANNING':
          vspPlanningList.push(item)
          break
        default:
          break
      }
    }

    if (serviceConfig?.VSP_PLANNING) {
      return vspPlanningList
    }

    if (serviceConfig?.ALIGNER_PLANNING_MANUFACTURING) {
      return productList
    }

    if (serviceConfig?.PLANNING) {
      return serviceList
    }

    if (serviceConfig?.MANUFACTURING) {
      return manufacturingProduct
    }

    return []
  }, [categoryList, serviceConfig])

  const handleBeforeUpload = (file: RcFile) => {
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      ErrorToast('Image size must be 20MB or less')
      return Upload.LIST_IGNORE
    }
    return true
  }

  const handleSubmit = async (
    values: ReturnType<typeof getInitialValues>,
    formik: FormikHelpers<ReturnType<typeof getInitialValues>>
  ) => {
    try {
      const payload = {
        product_type: values.product,
        product_name: values.name,
        product_category_id: safeParseInt(values.category),
        product_description: values.description,
        is_default: false,
        product_image: null,
        profile_id: safeParseInt(profileId),
        is_product_enabled: values.enabled,
      }

      const files =
        typeof values.photo === 'object' && values.photo instanceof File ? [values.photo] : null

      if (editingProductData) {
        await dispatchAction(
          editServiceProduct({serviceProductId: editingProductData?.id, payload, files})
        )
          .unwrap()
          .then(() => {
            dispatchAction(setEditingProductData(null))
            formik.resetForm()
            setShowAddProduct(false)
            refreshData({})
          })
          .catch((error: string) => {
            console.error('Failed to add service product:', error)
            if (error === 'GE0001') {
              ErrorToast('Product Name is already exist')
            } else if (error === 'AE0001') {
              ErrorToast('At least one product should be enabled')
            }
          })
      } else {
        await dispatchAction(addServiceProduct({payload, files}))
          .unwrap()
          .then(() => {
            dispatchAction(setEditingProductData(null))
            formik.resetForm()
            setShowAddProduct(false)
            refreshData({})
          })
          .catch((error: string) => {
            console.error('Failed to add service product:', error)
            if (error === 'GE0001') {
              ErrorToast('Product Name is already exist')
            }
          })
      }
    } catch (error) {
      throw error
    }
  }

  return (
    <Formik
      initialValues={getInitialValues(editingProductData ?? null)}
      validationSchema={addProductFormValidationSchema()}
      onSubmit={handleSubmit}
    >
      {(formik) => {
        const isEnabled = formik.values.enabled
        const switchTrackColor = isEnabled ? platte.tertiaryColor : '#D0D5DD'

        return (
          <Modal
            destroyOnClose
            open={showAddProduct}
            onCancel={() => {
              setProductImage('')
              formik?.resetForm()
              setShowAddProduct(false)
              dispatchAction(setEditingProductData(null))
            }}
            footer={null}
            centered
            width={720}
            title={
              <div className='flex flex-col items-start gap-2'>
                <div className='text-2xl font-semibold'>
                  {editingProductData ? 'Edit Product' : 'Add product'}
                </div>
                <div className='text-sm text-gray-600'>
                  {editingProductData
                    ? 'Edit the selected product'
                    : ' Add at least one product to get started. You can always add more or edit them later from Settings.'}
                </div>
              </div>
            }
          >
            <form onSubmit={formik.handleSubmit} className='space-y-4'>
              <FormikInput
                required
                label='Product Name'
                name='name'
                placeholder='Product name'
                value={formik.values.name}
                onChange={formik.handleChange}
                className='border p-2 rounded h-12'
              />
              <FormikInputTextArea
                label='Description'
                name='description'
                placeholder='Description'
                value={formik.values.description}
                onChange={formik.handleChange}
                className='w-full border p-2 rounded mt-2 h-12'
              />

              <div className='flex gap-3'>
                <FormikSelect
                  required
                  label='Product type'
                  name='product'
                  placeholder='Product type'
                  options={[
                    ...(serviceConfig?.VSP_PLANNING ? [{label: 'RTS VSP', value: 'ALIGNER'}] : []),
                    ...(!serviceConfig?.VSP_PLANNING &&
                    serviceConfig?.ALIGNER_PLANNING_MANUFACTURING
                      ? [{label: 'Product', value: 'ALIGNER'}]
                      : []),
                    ...(!serviceConfig?.VSP_PLANNING && serviceConfig?.PLANNING
                      ? [{label: 'Service', value: 'SERVICE'}]
                      : []),
                    ...(!serviceConfig?.VSP_PLANNING && serviceConfig?.MANUFACTURING
                      ? [{label: 'Product', value: 'MANUFACTURING_SERVICE'}]
                      : []),
                  ]}
                  isReturnObject={false}
                  value={formik.values.product}
                  disabled={hasValue(editingProductData)}
                />

                <FormikSelect
                  required
                  label='Category'
                  name='category'
                  placeholder='Category'
                  options={categoryListOptions}
                  isReturnObject={false}
                  value={formik.values.category}
                  disabled={!hasValue(formik.values.product) || hasValue(editingProductData)}
                />
              </div>

              <div className='flex flex-col gap-1'>
                <Upload
                  name='photo'
                  beforeUpload={handleBeforeUpload}
                  onChange={(info: UploadChangeParam<UploadFile<any>>) => {
                    // show loader when a new file is selected or while uploading
                    const file = info.file.originFileObj
                    if (!file) {
                      setProductImageLoading(false)
                      setProductImageProgress(null)
                      return
                    }
                    if (file.size > MAX_IMAGE_SIZE_BYTES) {
                      return
                    }
                    if (info.file.status === 'done' || info.file.status === 'uploading' || file) {
                      setProductImageLoading(true)
                      const reader = new FileReader()
                      reader.onprogress = (evt) => {
                        try {
                          if (evt.lengthComputable) {
                            const percent = Math.round((evt.loaded / evt.total) * 100)
                            setProductImageProgress(percent)
                          }
                        } catch (e) {
                          // ignore progress calculation errors
                        }
                      }
                      reader.onload = (e) => {
                        setProductImage(e.target?.result as string)
                        setProductImageProgress(100)
                        // keep spinner very briefly so user sees 100%
                        setTimeout(() => {
                          setProductImageLoading(false)
                          setProductImageProgress(null)
                        }, 350)
                      }
                      reader.onerror = () => {
                        setProductImageLoading(false)
                        setProductImageProgress(null)
                      }
                      reader.readAsDataURL(file)
                    } else {
                      setProductImageLoading(false)
                    }
                    formik.setFieldValue('photo', file)
                  }}
                  onRemove={() => {
                    formik.setFieldValue('photo', '')
                    setProductImage('')
                    setProductImageLoading(false)
                    setProductImageProgress(null)
                  }}
                  accept='image/*'
                  showUploadList={false}
                >
                  <Button
                    type='default'
                    className='w-full  mt-4 text-left bg-primarySupport text-primaryColor hover:!text-primaryColor border border-primaryColor hover:!border-primaryColor hover:!bg-primarySupport'
                  >
                    {productImageLoading ? (
                      <span className='flex items-center gap-2'>
                        <Spin size='small' />
                        <span>
                          Uploading
                          {productImageProgress !== null ? ` ${productImageProgress}%` : ''}
                        </span>
                      </span>
                    ) : productImage ? (
                      'Change image'
                    ) : (
                      'Upload image'
                    )}
                  </Button>
                </Upload>

                <div>
                  {productImage && (
                    <div className='mt-2'>
                      <Image
                        src={productImage}
                        alt='preview'
                        className='max-w-28 max-h-28 object-cover rounded border'
                      />
                      {productImageProgress !== null && (
                        <div className='mt-2'>
                          <Progress percent={productImageProgress} size='small' />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className='flex items-center gap-1 mt-2 text-xs text-gray-500'>
                  <InfoCircleOutlined className='text-gray-400' />
                  <span>Upload a square image within 20MB</span>
                </div>
              </div>
              <div className='flex gap-2 items-center'>
                <div className='font-semibold text-textColor'>
                  {isEnabled ? 'Enabled' : 'Disabled'}
                </div>
                <Switch
                  checked={formik.values.enabled}
                  onChange={() => formik.setFieldValue('enabled', !formik.values.enabled)}
                  size='small'
                  style={{backgroundColor: switchTrackColor}}
                />
                <div className='text-textColor'>Visible in product preference</div>
              </div>
              <div className={clsx('flex gap-2 px-5 pb-5')}>
                <button
                  className={clsx(
                    'w-full text-textColor border border-mediumGray py-3 px-6 rounded-lg font-semibold'
                  )}
                  type='button'
                  disabled={formik.isSubmitting}
                  onClick={() => {
                    setProductImage('')
                    formik?.resetForm()
                    setShowAddProduct(false)
                    dispatchAction(setEditingProductData(null))
                  }}
                >
                  Cancel
                </button>
                <AntdButton
                  className='w-full text-white !bg-primaryColor h-12 rounded-lg'
                  isLoading={formik.isSubmitting}
                  disabled={formik.isSubmitting}
                  text='Submit'
                  htmlType='submit'
                  onClick={() => formik.handleSubmit()}
                />
              </div>
            </form>
          </Modal>
        )
      }}
    </Formik>
  )
}

export default AddProductForm
