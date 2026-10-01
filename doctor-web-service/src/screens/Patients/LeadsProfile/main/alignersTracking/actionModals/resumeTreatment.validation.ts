import * as Yup from 'yup'
const resumeTreatmentValidation = Yup.object({
  daysToExtendAligner: Yup.number().when(
    ['extendCurrentAlignerWearDays', 'alignerChanged'],
    ([extendCurrentAlignerWearDays, alignerChanged], schema) => {
      return alignerChanged === false && extendCurrentAlignerWearDays === 'Custom'
        ? schema
            .required('Days to Extend Aligner is required')
            .max(40, 'You can extend the wear days maximum by 40 days')
        : schema.notRequired()
    }
  ),
})
export default resumeTreatmentValidation
