import React, {useContext} from 'react'
import {Card, SectionTitle} from '../ProductionSetupReview'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {AuthContext} from 'context/AuthContext'
import {safeParseInt} from 'utils/ConstFunctions'
import useActiveProfile from '@hooks/useActiveProfile'
import useAllUserPlan from '@hooks/useAllUserPlan'

const Badge: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({
  className = '',
  children,
  ...rest
}) => (
  <span
    className={[
      'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
      'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
      className,
    ].join(' ')}
    {...rest}
  >
    {children}
  </span>
)

const ProductionDetailsTable = () => {
  const {profileId} = useContext(AuthContext)
  const {activeProfile} = useActiveProfile()
  const {isPractice} = useAllUserPlan()
  const {manufacturingData, productSelected} = useSelector(
    (state: RootState) => state.productionSetup
  )

  return (
    <Card>
      {/* Header row: responsive */}
      {/* Mobile: stack in grid; Desktop: original flex row */}
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <SectionTitle title='Product details' className='mb-0' />

        {/* MOBILE layout */}
        <div className='md:hidden grid grid-cols-1 gap-2'>
          <div className='flex items-start gap-2'>
            <div className='shrink-0 font-semibold text-slate-700'>Product:</div>
            <div className='font-medium text-slate-800 break-words'>
              {productSelected?.product_name ?? '-'}
            </div>
          </div>

          <div className='flex items-start justify-between gap-3'>
            <Badge className='whitespace-nowrap'>
              Plan Type :{' '}
              {(safeParseInt(productSelected?.profile_id) === safeParseInt(profileId) ||
                safeParseInt(productSelected?.profile_id) ===
                  safeParseInt(activeProfile?.owner_profile_id)) &&
              !isPractice
                ? 'In house'
                : 'Outsourced'}
            </Badge>
            <div className='text-slate-600 text-sm text-right leading-5 break-words'>
              <span className='font-semibold'>Vendor:</span>{' '}
              <span className='font-medium'>{productSelected?.added_by_user_name ?? '-'}</span>
            </div>
          </div>
        </div>

        {/* DESKTOP layout (unchanged visual) */}
        <div className='hidden md:flex items-center gap-3 text-sm'>
          <div className='font-semibold text-slate-700'>Product:</div>
          <div className='font-medium text-slate-800'>{productSelected?.product_name}</div>

          <div className='h-4 w-px bg-slate-200' />
          <Badge>
            Plan Type :{' '}
            {(safeParseInt(productSelected?.profile_id) === safeParseInt(profileId) ||
              safeParseInt(productSelected?.profile_id) ===
                safeParseInt(activeProfile?.owner_profile_id)) &&
            !isPractice
              ? 'In house'
              : 'Outsourced'}
          </Badge>

          <div className='h-4 w-px bg-slate-200' />
          <div className='text-slate-600'>
            Vendor: <span className='font-medium'>{productSelected?.added_by_user_name}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='mt-4 overflow-hidden rounded-xl ring-1 ring-slate-200'>
        <div className='overflow-x-auto'>
          {/* Give the table a reasonable min width so columns don't crush on phones */}
          <table className='min-w-[680px] w-full divide-y divide-slate-200'>
            <thead className='bg-slate-50'>
              <tr>
                {['Category', 'Product', 'Stages', 'Series', 'Quantity'].map((h) => (
                  <th
                    key={h}
                    scope='col'
                    className='px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500'
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100 bg-white'>
              {manufacturingData?.upper_start && (
                <tr className='align-top'>
                  <td className='px-4 py-3 text-sm text-slate-600 whitespace-nowrap'>Aligners</td>
                  <td className='px-4 py-3 text-sm text-slate-800'>
                    <div className='font-medium'>{productSelected?.product_name}</div>
                    <div className='text-slate-600'>{productSelected?.product_description}</div>
                  </td>
                  <td className='px-4 py-3 text-sm text-slate-600 whitespace-nowrap'>UPPER</td>
                  <td className='px-4 py-3 text-sm text-slate-600 whitespace-nowrap'>
                    {`${manufacturingData?.upper_start} - ${manufacturingData?.upper_end ?? 0}`}
                  </td>
                  <td className='px-4 py-3 text-sm text-slate-800 whitespace-nowrap font-semibold'>
                    {manufacturingData.upper_end! - manufacturingData.upper_start + 1}
                  </td>
                </tr>
              )}

              {manufacturingData?.lower_start && (
                <tr className='align-top'>
                  <td className='px-4 py-3 text-sm text-slate-600 whitespace-nowrap'>Aligners</td>
                  <td className='px-4 py-3 text-sm text-slate-800'>
                    <div className='font-medium'>{productSelected?.product_name}</div>
                    <div className='text-slate-600'>{productSelected?.product_description}</div>
                  </td>
                  <td className='px-4 py-3 text-sm text-slate-600 whitespace-nowrap'>LOWER</td>
                  <td className='px-4 py-3 text-sm text-slate-600 whitespace-nowrap'>
                    {`${manufacturingData?.lower_start} - ${manufacturingData?.lower_end ?? 0}`}
                  </td>
                  <td className='px-4 py-3 text-sm text-slate-800 whitespace-nowrap font-semibold'>
                    {manufacturingData.lower_end! - manufacturingData?.lower_start + 1}
                  </td>
                </tr>
              )}
            </tbody>

            <tfoot>
              <tr>
                <td
                  colSpan={4}
                  className='px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase'
                >
                  Total:
                </td>
                <td className='px-4 py-3 text-sm font-semibold text-slate-800'>
                  {manufacturingData?.total ?? 0}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </Card>
  )
}

export default ProductionDetailsTable
