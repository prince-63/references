import useDispatchAction from '@hooks/useDispatchAction'
import clsx from 'clsx'
import {AuthContext} from 'context/AuthContext'
import {useContext} from 'react'
import {
  setProductSelected,
  setProductType,
} from 'redux/Slices/AppSlice/ProductionSetup/Production.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import {Product} from '../screens/ProductionSetup/SelectTaskManufacturingType'

export const ProductCard = ({
  product,
  setSelected,
  selected,
  size = 'default',
}: {
  product: Product
  selected: number
  setSelected: (selected: number, product: Product) => void
  size?: 'default' | 'compact'
}) => {
  const {dispatchAction} = useDispatchAction()
  const rawProductId = (product as any)?.id ?? (product as any)?.product_id
  const parsedProductId = safeParseInt(rawProductId)
  const hasValidId = Boolean(rawProductId) && parsedProductId !== 0
  const isSelected = hasValidId && selected === parsedProductId
  const typeBadge = product.product_type === 'SERVICE' ? 'SERVICE' : 'PRODUCT'
  const categoryBadge = product.product_category_name
  const {profileId} = useContext(AuthContext)
  const imageContainerClass = clsx(
    'relative w-full bg-lightGray',
    size === 'compact' ? 'h-40' : 'h-[400px] md:w-[400px]'
  )
  const vendor_name = product?.org_brand_name ?? product?.added_by_user_name
  return (
    <div
      onClick={() => {
        if (!hasValidId) return
        dispatchAction(
          setProductType(
            safeParseInt(product?.profile_id) === safeParseInt(profileId) ? 'IN_HOUSE' : 'OUTSOURCE'
          )
        )
        setSelected(parsedProductId, product)
        dispatchAction(setProductSelected(product))
      }}
      key={rawProductId}
      className={clsx(
        'w-full group border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col',
        size === 'compact' ? 'md:w-[250px]' : 'md:w-[380px]',
        isSelected ? 'border-primaryColor' : 'border-mediumGray'
      )}
      role='button'
      aria-pressed={isSelected}
    >
      {/* Responsive image header */}
      <div className={imageContainerClass}>
        {product.product_image ? (
          <img
            src={product.product_image}
            alt={product.product_name}
            className='object-cover w-full h-full'
            loading='lazy'
          />
        ) : (
          <div className='w-full h-full bg-gradient-to-br from-lightGray to-gray-200' />
        )}
      </div>

      {/* Body */}
      <div
        className={clsx(
          'flex flex-col justify-between flex-1',
          size === 'compact' ? 'p-2.5 pt-3' : 'p-4 pt-6'
        )}
      >
        {/* badges */}
        <div>
          <div className='flex items-center gap-2 mb-1.5'>
            <span
              className={clsx(
                'px-2 py-0.5 bg-lightGray font-semibold text-textColor rounded',
                size === 'compact' ? 'text-[10px]' : 'text-xs'
              )}
            >
              {typeBadge}
            </span>
            {categoryBadge && (
              <span
                className={clsx(
                  'px-2 py-0.5 bg-lightGray font-semibold text-textColor rounded truncate max-w-[70%] md:max-w-[60%]',
                  size === 'compact' ? 'text-[10px]' : 'text-xs'
                )}
              >
                {categoryBadge}
              </span>
            )}
          </div>

          <div
            className={clsx('font-semibold truncate', size === 'compact' ? 'text-xs' : 'text-base')}
          >
            {product.product_name}
          </div>

          {product.product_description && (
            <div
              className={clsx(
                'mt-0.5 text-textColor line-clamp-2',
                size === 'compact' ? 'text-[11px]' : 'text-sm'
              )}
            >
              {product.product_description}
            </div>
          )}

          {product.added_by_user_name && (
            <div
              className={clsx(
                'mt-0.5 text-textColor',
                size === 'compact' ? 'text-[11px]' : 'text-sm'
              )}
            >
              Vendor: {safeParseInt(profileId) === product?.profile_id ? 'Self' : vendor_name}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
