import React, {useEffect, useRef, useState} from 'react'
import CommonSVG from '../../../atom/SVG/CommonSVG'
import {SVG_DELETE, SVG_KEBAB_MENU, SVG_PENCIL_DARK_GRAY} from '../../../../utils/SvgConstants'
import When from '../../../when/When'

interface KebabMenuProps {
  onEditNoteClick: () => void
  onDeleteNoteClick: () => void
}

const KebabMenu = ({onEditNoteClick, onDeleteNoteClick}: KebabMenuProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const handleClick = () => {
    setIsMenuOpen((prev) => !prev)
  }
  const kebabRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (kebabRef.current && !kebabRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className='relative' ref={kebabRef}>
      <span className='cursor-pointer' onClick={handleClick}>
        <CommonSVG svg={SVG_KEBAB_MENU} height='16' width='16' />
      </span>
      <When isTrue={isMenuOpen}>
        <div className='absolute bg-white top-4 right-2 shadow-md w-[8rem] p-2 pb-0 rounded-md flex flex-col'>
          <div className='flex gap-2 items-center  p-1 cursor-pointer' onClick={onEditNoteClick}>
            <CommonSVG svg={SVG_PENCIL_DARK_GRAY} height='16' width='16' />
            <span className='flex items-center text-black text-sm font-medium'> Edit Note</span>
          </div>
          <hr />
          <div className='flex gap-2 p-1 cursor-pointer' onClick={onDeleteNoteClick}>
            <CommonSVG svg={SVG_DELETE} height='16' width='16' />
            <span className='flex items-center text-red text-sm font-medium'> Delete</span>
          </div>
        </div>
      </When>
    </div>
  )
}

export default KebabMenu
