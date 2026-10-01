import React from 'react'
import {ProductionFilter} from '../types/productionModule.types'
import productionStatusFilterOptions from '../../../@staticData/productionStatusFilterOptions'

type HeaderProps = {
  filter: ProductionFilter
}

const Header = ({filter}: HeaderProps) => {
  const activeFilterOption = productionStatusFilterOptions.find((option) => filter[option.value])
  return (
    <div>
      <p className='font-semibold text-2xl'>{activeFilterOption?.title}</p>
      <p className='text-textColor font-normal text-base'>{activeFilterOption?.subTitle}</p>
    </div>
  )
}

export default Header
