export const SELECT_SPECIFIC_TOOTH = 'SELECT_SPECIFIC_TOOTH'
export const SPECIFY_MIDLINE_INSTRUCTIONS = 'SPECIFY_MIDLINE_INSTRUCTIONS'

export const doNotMoveToothList = [
  {label: 'No such requirement', value: 'No such requirement'},
  {value: SELECT_SPECIFIC_TOOTH, label: 'Select tooth'},
]
export const midLineOptions = [
  {
    value: 'Maintain Midline',
    label: (
      <div className='flex flex-col font-medium'>
        <p>Maintain Midline</p>
        <p className='text-textColor font-normal'>No changes will be made to the midline.</p>
      </div>
    ),
  },
  {
    value: 'Improve Midline (As per us)',
    label: (
      <div className='flex flex-col font-medium'>
        <p>Improve Midline (As per us)</p>
        <p className='text-textColor font-normal'>
          We will determine the optimal midline adjustment
        </p>
      </div>
    ),
  },
  {
    value: SPECIFY_MIDLINE_INSTRUCTIONS,
    label: 'Specify Instructions',
  },
]
export const attachmentOptions = [
  {label: 'Place as needed', value: 'Place as needed'},
  {
    label: 'Do not place on the following teeth',
    value: SELECT_SPECIFIC_TOOTH,
  },
]
export const iprOptions = [
  {
    label: 'Rely on our decision',
    value: 'Rely on our decision',
  },
  {
    label: 'Strictly no IPR',
    value: 'Strictly no IPR',
  },
]
export const extractionOptions = [
  {label: 'Rely on our decision', value: 'Rely on our decision'},
  {label: 'No extraction', value: 'No extraction'},
  {label: 'Specific tooth/teeth', value: SELECT_SPECIFIC_TOOTH},
]
export const prescriptionTreatmentTypesOptions = [
  {label: 'Both Arch 7X7', value: 'Both Arch 7X7'},
  {label: 'Both Arch 3X3', value: 'Both Arch 3X3'},
  {label: 'Upper Arch 7X7', value: 'Upper Arch 7X7'},
  {label: 'Upper Arch 3X3', value: 'Upper Arch 3X3'},
  {label: 'Lower Arch 7X7', value: 'Lower Arch 7X7'},
  {label: 'Lower Arch 3X3', value: 'Lower Arch 3X3'},
  {label: 'Certain Tooth/Teeth', value: SELECT_SPECIFIC_TOOTH},
]
