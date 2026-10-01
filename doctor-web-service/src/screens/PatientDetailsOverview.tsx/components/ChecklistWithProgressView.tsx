import React, {useMemo} from 'react'
import {Checkbox} from 'antd'
import {SectionTitle} from 'screens/Kanban/screens/ProductionReview/ProductionSetupReview'

type ViewItem = {
  id?: number
  title: string
  checked: boolean
}

type Props = {
  /** Pure view-only list coming from API */
  productList?: ViewItem[]
  /** Optional: custom heading (defaults to 'Production Checklist') */
  heading?: string
}

const ChecklistWithProgressView: React.FC<Props> = ({productList = [], heading}) => {
  // normalize list (defensive against weird shapes)
  const normalized = useMemo<ViewItem[]>(
    () =>
      (Array.isArray(productList) ? productList : [])
        .filter((i) => i && typeof i.title === 'string')
        .map((i, idx) => ({
          id: i.id ?? idx,
          title: i.title,
          checked: !!i.checked,
        })),
    [productList]
  )

  const completed = normalized.filter((i) => i.checked).length
  const total = normalized.length
  const percent = total ? Math.round((completed / total) * 100) : 0

  return (
    <div className='w-full font-[figtree] px-2 md:px-4 py-4 md:py-6'>
      <div className='mb-5'>
        <SectionTitle
          title={` ${heading ?? 'Production Checklist'} (${completed}/${total} done)`}
        />
        <div className='h-[14px] w-full mt-4 rounded-full bg-[#EEF0F7] overflow-hidden'>
          <div
            className='h-full rounded-full bg-gradient-to-r from-[#5B3FFF] to-[#725BFF] transition-all duration-300'
            style={{width: `${percent}%`}}
          />
        </div>
      </div>

      <ul className='mb-4 max-h-[340px] overflow-y-auto pr-1'>
        {normalized.length > 0 ? (
          normalized.map((item) => (
            <li
              key={`${item.id}-${item.title}`}
              className='flex items-start gap-3 py-2.5 border-b border-[#EFF1F5] last:border-none'
            >
              <Checkbox
                checked={item.checked}
                disabled
                className='!mt-1 [&_.ant-checkbox-inner]:!rounded-[4px]'
              />
              <div className='flex-1 flex justify-between items-center min-h-[24px]'>
                <span
                  className={`text-[15px] leading-snug mt-1 ${
                    item.checked ? 'text-[#636A80]' : 'text-[#2B303B]'
                  }`}
                >
                  {item.title}
                </span>
                {item.checked && (
                  <span className='text-xs font-medium text-[#636A80] ml-3 shrink-0'>
                    Completed
                  </span>
                )}
              </div>
            </li>
          ))
        ) : (
          <li className='text-[#98A0AF] text-sm py-2'>No tasks yet</li>
        )}
      </ul>
    </div>
  )
}

export default ChecklistWithProgressView
