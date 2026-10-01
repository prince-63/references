import toothNumbers from '@staticData/toothNumbers'
import InputTextArea from 'components/atom/Inputs/InputTextArea'
import BorderedCard from 'components/BorderedCard/BorderedCard'
import MultiSelect from 'components/multiSelect/MultiSelect'
import {TagRenderForMissingToothDropdown} from 'components/tags/TagRenderForMissingToothDropdown'
import {FC} from 'react'
import {TootTypeSelection} from '../SetupTreatmentPlanBraces'
import {FormikProps} from 'formik'
interface Props {
  formik: FormikProps<any> // Add the generic type for FormikProps
  itemTooths: TootTypeSelection[]
  setItemTooths: (prevItems: any) => void
}
const StepTwo: FC<Props> = ({formik, itemTooths, setItemTooths}) => {
  const handleToothClick = (index: number, item: {label: any; isSelected?: boolean}) => {
    setItemTooths((prevItems: TootTypeSelection[]) =>
      prevItems.map((item: TootTypeSelection, i: number) =>
        i === index ? {...item, isSelected: !item.isSelected} : item
      )
    )

    const tempArray = formik.getFieldProps('teeth_extraction').value
    if (tempArray.includes(item.label)) {
      formik.setFieldValue(
        'teeth_extraction',
        tempArray.filter((label: string) => label !== item.label)
      )
    } else {
      formik.setFieldValue('teeth_extraction', [...tempArray, item.label])
    }
  }
  return (
    <BorderedCard
      header={{
        title: 'Extraction',
        icon: 2,
      }}
      className='bg-primaryColor text-white'
    >
      <div className='mb-4'>
        <div className='text-textColor text-lg font-medium mb-2'>Select tooth</div>
        <MultiSelect
          className=''
          handleOnChange={(value) => {
            formik.setFieldValue('teeth_extraction', value)
            const selectedItems = new Set(value)
            setItemTooths((prevItems: TootTypeSelection[]) =>
              prevItems.map((item) => ({
                ...item,
                isSelected: selectedItems.has(item.label),
              }))
            )
          }}
          options={toothNumbers.map((num) => ({value: num}))}
          tagRender={TagRenderForMissingToothDropdown}
          value={formik.values?.teeth_extraction}
        />
      </div>
      <div className='selection-container w-[100%] mt-4'>
        {itemTooths &&
          itemTooths.map((item, index) => (
            <div
              key={index}
              className={`w-24 h-10 px-4 py-2.5 my-1 md:my-0 mr-4 rounded border justify-center items-center gap-1 inline-flex cursor-pointer ${
                item.isSelected ? 'border-secondaryColor bg-secondarySupport' : 'border-mediumGray'
              }`}
              onClick={() => handleToothClick(index, item)}
            >
              <div
                className={`text-center text-base font-medium font-['Figtree'] ${
                  item.isSelected ? 'text-secondaryColor' : 'text-textColor'
                }`}
              >
                {item.label}
              </div>
            </div>
          ))}
      </div>
      <div className='mt-4'>
        <InputTextArea
          label='Remarks (Optional)'
          name='extraction_remarks'
          formik={formik}
          maxLength={200}
          className='py-2 rounded-lg border border-mediumGray h-16'
          classNameLabel='text-stone-500 text-lg font-medium '
        />
      </div>
    </BorderedCard>
  )
}

export default StepTwo
