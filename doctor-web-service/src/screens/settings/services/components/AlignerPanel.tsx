import React, {useContext, useState} from 'react'
import type {Product} from './types'
import {Dropdown, Menu, Switch} from 'antd'
import {editServiceProduct, setEditingProductData} from 'redux/Slices/UISlices/services.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import {MoreOutlined, EditOutlined, EyeOutlined} from '@ant-design/icons'
import getColorPalette from 'utils/getColorPalette'
import {updateProductEnabledState} from 'redux/Slices/AppSlice/ProductionSetup/Production.slice'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import DisabledProductConfirmationModal from './DisabledProductConfirmationModal'
import RestrictDisabledProductModal from './RestrictDisabledProductModal'

type Props = {
  listData: Product[]
  setShowAddProduct: (show: boolean) => void
}

const AlignerPanel: React.FC<Props> = ({listData, setShowAddProduct}) => {
  const {profileId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const palette = getColorPalette()
  const [pendingProductId, setPendingProductId] = useState<number | null>(null)
  const [confirmDisabledModalOpen, setConfirmDisabledModalOpen] = useState(false)
  const [restrictDisabledModalOpen, setRestrictDisabledModalOpen] = useState(false)
  const [productSelected, setProductSelected] = useState<Product | null>(null)
  const isLastProductEnabled = listData.filter((prod) => prod.is_product_enabled).length <= 1

  const enableProductItems = (productSelected: Product | null) => {
    if (productSelected !== null) {
      const payload = {
        product_type: productSelected.product_type,
        product_name: productSelected.product_name,
        product_category_id: safeParseInt(productSelected.product_category_id),
        product_description: productSelected.product_description ?? '',
        is_default: productSelected.is_default,
        is_product_enabled: !productSelected.is_product_enabled,
        product_image: null,
        profile_id: safeParseInt(profileId),
      }

      const files =
        typeof productSelected.product_image === 'object' && productSelected.product_image !== null
          ? [productSelected.product_image]
          : []

      setPendingProductId(productSelected.id)
      dispatchAction(editServiceProduct({serviceProductId: productSelected?.id, payload, files}))
        .unwrap()
        .then(() => {
          setConfirmDisabledModalOpen(false)
          dispatchAction(
            updateProductEnabledState({
              productId: productSelected.id,
              isEnabled: !productSelected.is_product_enabled,
            })
          )
        })
        .catch((error: string) => {
          if (error === 'AEE002') {
            return
          }
          ErrorToast('Unable to update product visibility. Please try again.')
        })
        .finally(() => {
          setPendingProductId(null)
        })
    }
  }

  return (
    <section className=''>
      {confirmDisabledModalOpen && (
        <DisabledProductConfirmationModal
          setClose={setConfirmDisabledModalOpen}
          onConfirm={() => enableProductItems(productSelected)}
        />
      )}
      {restrictDisabledModalOpen && (
        <RestrictDisabledProductModal setClose={setRestrictDisabledModalOpen} />
      )}
      <div className='flex flex-wrap gap-4'>
        {listData.map((prod: Product) => {
          const typeBadge = prod.product_type === 'SERVICE' ? 'SERVICE' : 'PRODUCT'
          const categoryBadge = prod.product_category_name

          return (
            <div
              key={prod.id}
              className='group border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col'
            >
              {/* Image header */}
              <div className='relative h-[400px] md:w-[400px] w-full bg-lightGray'>
                {prod.product_image ? (
                  <img
                    src={prod.product_image}
                    alt={prod.product_name}
                    className='h-full w-full object-contain'
                  />
                ) : (
                  <div className='h-full w-full bg-gradient-to-br from-lightGray to-gray-200' />
                )}

                {/* Card menu */}
                <div className='absolute top-2 right-2'>
                  <Dropdown
                    overlay={
                      <Menu>
                        <Menu.Item
                          key='edit'
                          icon={<EditOutlined />}
                          onClick={() => {
                            setShowAddProduct(true)
                            dispatchAction(setEditingProductData(prod))
                          }}
                        >
                          Edit
                        </Menu.Item>
                      </Menu>
                    }
                    trigger={['click']}
                  >
                    <MoreOutlined className='text-white/90 bg-black/30 hover:bg-black/40 rounded p-1 text-lg cursor-pointer' />
                  </Dropdown>
                </div>
              </div>

              {/* Body */}
              <div className='flex flex-col justify-between p-4 pt-6 flex-1'>
                {/* badges */}
                <div>
                  <div className='flex items-center gap-2 mb-2'>
                    <span className='px-2 py-0.5 bg-lightGray font-semibold text-textColor text-xs rounded'>
                      {typeBadge}
                    </span>
                    {categoryBadge && (
                      <span className='px-2 py-0.5 bg-lightGray font-semibold text-textColor text-xs rounded truncate ...'>
                        {categoryBadge}
                      </span>
                    )}
                  </div>

                  <div className='font-semibold text-base  truncate ...'>{prod.product_name}</div>
                  {prod.product_description && (
                    <div className='mt-1 text-sm text-textColor line-clamp-2 overflow-hidden text-ellipsis'>
                      {prod.product_description}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className='mt-4 flex items-center justify-between'>
                  <div className='flex items-center gap-2 text-sm text-textColor'>
                    <EyeOutlined />
                    <span>
                      {prod.is_product_enabled
                        ? 'Visible in preferences'
                        : 'Hidden from preferences'}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm text-textColor'>
                      {prod.is_product_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <Switch
                      checked={prod.is_product_enabled}
                      onChange={() => {
                        if (isLastProductEnabled && prod.is_product_enabled) {
                          setRestrictDisabledModalOpen(true)
                          return
                        }
                        setProductSelected(prod)
                        if (prod.is_product_enabled) {
                          setConfirmDisabledModalOpen(true)
                        } else {
                          enableProductItems(prod)
                        }
                      }}
                      size='small'
                      loading={pendingProductId === prod.id}
                      style={{
                        backgroundColor: prod.is_product_enabled
                          ? palette.tertiaryColor
                          : palette.grayDisabled,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {listData.length === 0 && (
        <div className='flex flex-col items-center justify-center py-20'>
          <div className='w-24 h-24 bg-lightGray rounded-full flex items-center justify-center mb-4'>
            <div className='text-3xl text-gray-400'>🗂️</div>
          </div>
          <div className='text-lg font-semibold text-textColor mb-2'>No Products added</div>
          <div className='text-sm text-gray-500 mb-4 text-center max-w-xl'>
            There are no products added yet. add a new product to get started.
          </div>
        </div>
      )}
    </section>
  )
}

export default AlignerPanel
