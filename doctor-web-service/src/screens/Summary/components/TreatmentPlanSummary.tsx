import {DataWrapper} from './DataWrapper'
import {ConditionalValueDiv} from './ConditionalValueDiv'
import hasValue from 'utils/hasValue'
import formatAligners from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/helpers/formatAligners'
import {formatPluralizedString} from 'utils/ConstFunctions'
import When from 'components/when/When'
import InfoIcon from 'assets/icons/InfoIcon'
import clsx from 'clsx'
import videoView from 'assets/images/videoView.png'
import videoUploadTypesConstants from '@constants/videoUploadTypes.constants'
import ReactPlayer from 'react-player'
import {unReviewableExtension} from 'screens/Patients/LeadsProfile/main/treatment/setUpTreatmentPlan/components/CommonVideoView'

const TreatmentPlanSummary = ({treatmentPlan}: {treatmentPlan: any}) => {
  const mapVideoKeyToLabel = (key: string): string => {
    switch (key) {
      case 'SINGLE_VIDEO':
        return 'Single'
      case 'FRONT_VIDEO':
        return 'Front'
      case 'TOP_VIDEO':
        return 'Top'
      case 'BOTTOM_VIDEO':
        return 'Bottom'
      case 'LEFT_VIDEO':
        return 'Left'
      case 'RIGHT_VIDEO':
        return 'Right'
      default:
        return key // If no match, return the original key
    }
  }

  return (
    <div>
      <DataWrapper
        title='Treatment details'
        isShow={
          hasValue(treatmentPlan?.brand_name) ||
          hasValue(treatmentPlan?.days_to_wear_each_aligner) ||
          hasValue(treatmentPlan?.recommended_hours_to_wear_aligners)
        }
        showBorder={
          hasValue(treatmentPlan?.aligner_details_meta_data?.upper_jaw?.range) ||
          hasValue(treatmentPlan?.aligner_details_meta_data?.lower_jaw?.range)
        }
      >
        <ConditionalValueDiv label='Treatment type' value={'Clear aligners treatment'} />
        <ConditionalValueDiv label='Brand name' value={treatmentPlan?.brand_name} />
        <ConditionalValueDiv
          label='Recommended days to wear each aligner'
          value={
            hasValue(treatmentPlan?.days_to_wear_each_aligner)
              ? formatPluralizedString(treatmentPlan?.days_to_wear_each_aligner, 'day')
              : null
          }
        />
        <ConditionalValueDiv
          label='Recommended daily wear hours'
          value={
            hasValue(treatmentPlan?.recommended_hours_to_wear_aligners)
              ? formatPluralizedString(treatmentPlan?.recommended_hours_to_wear_aligners, 'hour')
              : null
          }
        />
      </DataWrapper>

      <DataWrapper
        title='Aligner details'
        isShow={
          hasValue(treatmentPlan?.aligner_details_meta_data?.upper_jaw?.range) ||
          hasValue(treatmentPlan?.aligner_details_meta_data?.lower_jaw?.range)
        }
        showBorder={
          hasValue(treatmentPlan?.treatment_planning_software) ||
          hasValue(treatmentPlan?.treatment_planning_link) ||
          hasValue(treatmentPlan?.remarks)
        }
      >
        <ConditionalValueDiv
          label='Upper jaw range'
          value={
            hasValue(treatmentPlan?.aligner_details_meta_data?.upper_jaw?.range) ? (
              <div className='flex flex-col gap-3 '>
                {formatAligners(
                  treatmentPlan?.aligner_details_meta_data?.upper_jaw?.range ?? []
                ).map((range, index) => (
                  <p key={index}>{range}</p>
                ))}
              </div>
            ) : null
          }
        />
        <ConditionalValueDiv
          label='Lower jaw range'
          value={
            hasValue(treatmentPlan?.aligner_details_meta_data?.lower_jaw?.range) ? (
              <div className='flex flex-col gap-3 '>
                {formatAligners(
                  treatmentPlan?.aligner_details_meta_data?.lower_jaw?.range ?? []
                ).map((range, index) => (
                  <p key={index}>{range}</p>
                ))}
              </div>
            ) : null
          }
        />
      </DataWrapper>

      <DataWrapper
        title={
          <div className='flex justify-between flex-wrap items-center'>
            <div> Treatment plan details</div>
            <div className='flex gap-1 items-start'>
              <div className='md:mt-[2px]'>
                <InfoIcon color='#666666' width='16' height='16' />
              </div>
              <div className='md:mt-[2px] text-xs text-textColor'>
                Uploaded videos can be accessed on the treatment plan page
              </div>
            </div>
          </div>
        }
        isShow={
          hasValue(treatmentPlan?.treatment_planning_link) ||
          hasValue(treatmentPlan?.remarks) ||
          hasValue(treatmentPlan?.treatment_plan_videos)
        }
        showBorder={false}
      >
        <ConditionalValueDiv
          label=' Planning link'
          value={treatmentPlan?.treatment_planning_link}
          classNameValue='!underline'
        />

        <ConditionalValueDiv label='Remarks ' value={treatmentPlan?.remarks} />

        <When isTrue={hasValue(treatmentPlan?.treatment_plan_videos)}>
          <div className={clsx('text-[14px] font-semibold')}>Planning video</div>
          <div className='flex flex-wrap gap-4 mt-2'>
            {treatmentPlan?.treatment_plan_videos.map((video: any) => (
              <div key={video.treatment_plan_video_tags}>
                {video.treatment_plan_video_tags !== videoUploadTypesConstants.SINGLE_VIDEO && (
                  <div className='text-textColor text-sm font-normal'>
                    {mapVideoKeyToLabel(video.treatment_plan_video_tags)}
                  </div>
                )}

                <ReactPlayer
                  url={video.video_url}
                  className='h-[80px] w-[80px] rounded-2xl object-cover border border-mediumGray mt-1'
                  playing={false}
                  controls={false}
                  width='80px'
                  height='80px'
                  light={
                    unReviewableExtension.includes(video.video_url.split('.').pop() ?? '') &&
                    videoView
                  }
                />
              </div>
            ))}
          </div>
        </When>
      </DataWrapper>
    </div>
  )
}

export default TreatmentPlanSummary
