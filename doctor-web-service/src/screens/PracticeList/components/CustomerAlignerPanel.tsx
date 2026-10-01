import {useState} from 'react'
import {Switch} from 'antd'
import {EyeOutlined} from '@ant-design/icons'
import getColorPalette from 'utils/getColorPalette'
import RestrictDisabledProductModal from 'screens/settings/services/components/RestrictDisabledProductModal'
import {Product} from 'screens/Kanban/screens/ProductionSetup/SelectTaskManufacturingType'

type Props = {
  listData: Array<Product & {is_assigned?: boolean}>
  setShowAddProduct: (show: boolean) => void
  onToggleAssignment: (product: Product & {isAssigned?: boolean}) => void | Promise<void>
  assignmentLoadingId: number | null
  readMode?: boolean
}

const CustomerAlignerPanel: React.FC<Props> = ({
  listData,
  onToggleAssignment,
  assignmentLoadingId,
  readMode = false,
}) => {
  const palette = getColorPalette()
  const [showRestrictModal, setShowRestrictModal] = useState(false)

  const handleToggle = async (prod: Product & {isAssigned?: boolean}) => {
    try {
      await Promise.resolve(onToggleAssignment(prod))
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || error?.response?.data?.status?.message
      const errorCode = error?.response?.data?.error_code
      if (
        errorCode === 'AE0001' ||
        errorMessage === 'At least one service product must exist for the customer.'
      ) {
        setShowRestrictModal(true)
      } else {
        // surface other errors to console for debugging; UI remains unchanged
        // eslint-disable-next-line no-console
        console.error(error)
      }
    }
  }
  return (
    <section className=''>
      <div className='flex flex-wrap gap-4'>
        {listData.map((prod: Product & {is_assigned?: boolean}) => {
          const typeBadge =
            prod.product_type === 'ALIGNER' || prod?.product_type === 'MANUFACTURING_SERVICE'
              ? 'PRODUCT'
              : 'SERVICE'
          const categoryBadge = prod.product_category_name
          const isAssigned = Boolean(prod.is_assigned)

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
                {readMode ? (
                  <></>
                ) : (
                  <div className='mt-4 flex items-center justify-between'>
                    <div className='flex items-center gap-2 text-sm text-textColor'>
                      <EyeOutlined />
                      <span>{isAssigned ? 'Visible in preferences' : 'Hide in preferences'}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm text-textColor'>
                        {isAssigned ? 'Enabled' : 'Disabled'}
                      </span>
                      <Switch
                        checked={isAssigned}
                        onChange={() => handleToggle(prod)}
                        size='small'
                        loading={assignmentLoadingId === prod.id}
                        style={{
                          backgroundColor: isAssigned
                            ? palette.tertiaryColor
                            : palette.grayDisabled,
                        }}
                      />
                    </div>
                  </div>
                )}
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
      {showRestrictModal && <RestrictDisabledProductModal setClose={setShowRestrictModal} />}
    </section>
  )
}

export default CustomerAlignerPanel
