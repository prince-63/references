import stlFileTypeConstants from '@constants/stlFileType.constants'

export default [
  {
    label: 'STL for Direct Printed Aligners (DPA)',
    value: stlFileTypeConstants.DIRECT_PRINTED,
    subTitle: 'For direct printing of Aligners.',
  },
  {
    label: 'STL for Standard Model (solid)',
    value: stlFileTypeConstants['THREE_D_PRINTED'],
    subTitle: 'Solid model used for thermoforming aligners.',
  },
  {
    label: 'STL for Hollow Model',
    value: stlFileTypeConstants['HOLLOW_D_PRINTED'],
    subTitle: 'Hollow model for lightweight aligner printing.',
  },
]
