import InputText from 'components/atom/Inputs/InputText'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import Spinner from 'components/spinner/Spinner'
import When from 'components/when/When'
import React, {FC} from 'react'
import {SVG_PLUS_PRIMARY} from 'utils/SvgConstants'

interface Props {
  name: string
  formik: any
  placeholder?: string
  maxLength?: number
  loader: boolean
  onClick: () => void
}
const FieldAddInput: FC<Props> = ({name, formik, placeholder, maxLength, onClick, loader}) => {
  return (
    <div>
      <When isTrue={!loader}>
        <div className='flex flex-row gap-4 items-center mt-1'>
          <div className='md:w-[50%] w-full mt-2'>
            <InputText
              name={name}
              className=''
              label=''
              placeholder={placeholder}
              classNameLabel='text-sm text-textColor font-medium'
              formik={formik}
              required={false}
              disabled={false}
              maxLength={maxLength}
            />
          </div>
          <Spinner loading={loader} />

          <div
            className='md:w-14 md:h-14 w-12 h-12 px-4 bg-primarySupport rounded-lg justify-center items-center gap-1 inline-flex cursor-pointer'
            onClick={() => onClick()}
          >
            <CommonSVG svg={SVG_PLUS_PRIMARY} width='47' height='47' />
          </div>
        </div>
      </When>
    </div>
  )
}

export default FieldAddInput
