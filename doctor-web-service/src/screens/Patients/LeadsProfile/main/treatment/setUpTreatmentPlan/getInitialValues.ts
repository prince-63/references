import hasValue from 'utils/hasValue'
import {FormValues, ITreatmentPlan} from '../types/treatmentPlan.types'
import {generateOption} from '@utils/generateOption'
import treatmentTypesList from '@staticData/treatmentTypesList'
import {dailyWearHoursList, wearDaysList} from 'utils/Constant'
import treatmentSoftwareList from '@staticData/treatmentSoftwareList'
import uploadVideoTypeConstants from '@constants/uploadVideoType.constants'
import subTreatmentTypeConstants from '@constants/subTreatmentType.constants'

export const getInitialValues = ({
  treatmentPlan,
  treatmentPlanName,
  toBeCloned,
}: {
  treatmentPlan: ITreatmentPlan
  treatmentPlanName: string
  toBeCloned: boolean
}): FormValues => {
  if (hasValue(treatmentPlan)) {
    const hasUpperRange =
      (treatmentPlan.aligner_details_meta_data.upper_jaw?.range?.length ?? 0) > 0
    const hasLowerRange =
      (treatmentPlan.aligner_details_meta_data.lower_jaw?.range?.length ?? 0) > 0

    return {
      treatment_plan_tag_name: treatmentPlan.treatment_plan_tag_name,
      treatment_sub_type: generateOption(
        treatmentPlan.treatment_sub_type?.toString() ?? '',
        treatmentTypesList
      ),
      days_to_wear_each_aligner: generateOption(
        treatmentPlan.days_to_wear_each_aligner ?? 0,
        wearDaysList
      ),
      brand_name:
        treatmentPlan.production_lab_details && !toBeCloned
          ? {
              label: treatmentPlan.production_lab_details.brand_name,
              value: treatmentPlan.production_lab_details.production_lab_id,
            }
          : null,
      upperJaw: hasUpperRange,
      lowerJaw: hasLowerRange,
      recommended_hours_to_wear_aligners: generateOption(
        treatmentPlan.recommended_hours_to_wear_aligners ?? 0,
        dailyWearHoursList
      ),
      upperJawStartsWith: hasUpperRange
        ? (treatmentPlan.aligner_details_meta_data.upper_jaw?.starts_with?.toString() ?? '')
        : '',
      upperJawEndsWith: hasUpperRange
        ? (treatmentPlan.aligner_details_meta_data.upper_jaw?.ends_with?.toString() ?? '')
        : '',
      lowerJawStartsWith: hasLowerRange
        ? (treatmentPlan.aligner_details_meta_data.lower_jaw?.starts_with?.toString() ?? '')
        : '',
      lowerJawEndsWith: hasLowerRange
        ? (treatmentPlan.aligner_details_meta_data.lower_jaw?.ends_with?.toString() ?? '')
        : '',
      treatment_planning_link: treatmentPlan.treatment_planning_link ?? '',
      treatment_planning_software: generateOption(
        treatmentPlan.treatment_planning_software ?? '',
        treatmentSoftwareList
      ),
      remarks: treatmentPlan.remarks ?? '',
      files:
        treatmentPlan.filesToSave ??
        treatmentPlan.files?.map((file) => new File([], file.name ?? '')) ??
        [],
      other_files:
        treatmentPlan.otherFilesToSave ??
        treatmentPlan.other_files?.map((file) => new File([], file.name ?? '')) ??
        [],
      isAnyJawSelected: hasUpperRange || hasLowerRange,
      link_display_patient:
        treatmentPlan.is_link_display_patient ?? treatmentPlan.link_display_patient ?? true,
      video_display_to_patient:
        treatmentPlan?.treatment_plan_videos?.[0]?.video_to_display_to_patient ??
        treatmentPlan.video_display_to_patient ??
        false,
      video_type: hasValue(treatmentPlan.video_files?.SINGLE_VIDEO)
        ? uploadVideoTypeConstants.SINGLE_VIDEO
        : uploadVideoTypeConstants.WITH_TAG,
      video_files: treatmentPlan.video_files ?? null,
      treatment_plan_upload_type:
        treatmentPlan?.treatment_plan_upload_type ?? 'TREATMENT_PLANNING_LINK',
      pdf_file:
        (treatmentPlan?.pdf_file_to_save ?? hasValue(treatmentPlan?.pdf_files?.[0]))
          ? new File([], treatmentPlan?.pdf_files?.[0]?.name ?? '')
          : null,
      file_ids_to_clone: treatmentPlan?.files?.map((file) => file?.file_id) ?? [],
    }
  } else {
    return {
      treatment_plan_tag_name: treatmentPlanName,
      treatment_sub_type: treatmentTypesList.find(
        (type) => type.value === subTreatmentTypeConstants.ALIGNERS
      )!,
      days_to_wear_each_aligner: generateOption(14, wearDaysList),
      brand_name: null,
      upperJaw: false,
      lowerJaw: false,
      recommended_hours_to_wear_aligners: generateOption(22, dailyWearHoursList),
      upperJawStartsWith: '',
      upperJawEndsWith: '',
      lowerJawStartsWith: '',
      lowerJawEndsWith: '',
      treatment_planning_link: '',
      treatment_planning_software: null,
      remarks: '',
      files: [],
      other_files: [],
      video_files: null,
      isAnyJawSelected: false,
      video_type: 'SINGLE_VIDEO',
      link_display_patient: false,
      video_display_to_patient: false,
      treatment_plan_upload_type: 'TREATMENT_PLANNING_LINK',
      pdf_file: null,
      file_ids_to_clone: [],
    }
  }
}
