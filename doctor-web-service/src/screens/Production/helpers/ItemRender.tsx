import {SVG_PAGINATION_NEXT} from '../../../utils/SvgConstants'

export const ItemRender = (
  _: number,
  type: string,
  originalElement: React.ReactNode
): React.ReactNode => {
  if (type === 'next') {
    return (
      <div className='flex justify-center items-center h-full'>
        <SVG_PAGINATION_NEXT />
      </div>
    )
  } else if (type === 'prev') {
    return (
      <div className='flex justify-center items-center h-full transform rotate-180'>
        <SVG_PAGINATION_NEXT />
      </div>
    )
  }
  return originalElement
}
