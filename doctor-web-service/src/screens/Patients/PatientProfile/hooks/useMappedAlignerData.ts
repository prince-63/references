import {useMemo} from 'react'
import hasValue from '../../../../utils/hasValue'
import {RowData} from '../types/Aligners.types'
import alignerStatusOptions from '../../../../@staticData/alignerStatusOptions'

const useMappedAlignerData = (dataTreatmentPlan: any): RowData[] => {
  const mappedAligners = useMemo(() => {
    if (!hasValue(dataTreatmentPlan)) return []

    // const lowerRange = dataTreatmentPlan.aligner_journeys[0].lower_range
    // const upperRange = dataTreatmentPlan.aligner_journeys[0].upper_range

    // const minValue = Math.min(...lowerRange, ...upperRange)
    const tempArray: RowData[] = []
    dataTreatmentPlan?.aligner_journeys[0].aligners
      // .filter((item: any) => {
      //   return item.sr_no >= minValue
      // })
      .forEach((element: any) => {
        const payload: RowData = {
          id: element?.sr_no,
          alignerNo: element?.sr_no,
          startDate: element?.start_date,
          endDate: element?.end_date,
          changeDate: element?.change_date,
          alignerType: element?.jaw_type,
          daysWorn: element?.no_of_days_to_wear,
          avgWearTime: element?.avg_time_in_secs,
          compliance: element?.aligner_compliance,
          currentAlignerNo: dataTreatmentPlan?.aligner_journeys[0]?.current_aligner_no,
          change_offset: element?.change_offset,
          productionLab: element?.aligner_production?.production_lab?.name,
          productionLabId: element?.aligner_production?.production_lab?.lab_id,
          sub_status: element?.aligner_production?.sub_status ?? alignerStatusOptions[0].value,
          status: element?.aligner_production?.status ?? alignerStatusOptions[0].value,
          statusUpdatedOn: element?.aligner_production?.last_status_update,
        }
        tempArray.push(payload)
      })

    tempArray.sort((a, b) => a.id - b.id)
    return tempArray
  }, [dataTreatmentPlan])

  return mappedAligners
}

export default useMappedAlignerData
