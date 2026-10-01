import React from 'react'
import AlignerAnalyticsChart from './AlignerAnalyticsChart'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {Spin} from 'antd'
import Spinner from 'components/spinner/Spinner'

const AlignerChartSection = () => {
  const {dataCounts, loadingCounts} = useSelector(
    (state: RootState) => state.AlignerPatientAnalytics
  )
  const {at_risk, needs_attention, on_track, on_track_percentage} = dataCounts.patient_compliance
  const {on_time, delay_less_than7_days, delay_more_than7_days, on_time_percentage} =
    dataCounts.aligner_changes_till_date
  const {perfect_fit, perfect_fit_percentage, some_issue} = dataCounts.aligner_check_in_till_date
  const {
    broken_aligner,
    irritation_to_gums,
    missing_aligner,
    sharp_edges,
    total_issue_reported_percentage,
  } = dataCounts.issues_reported_till_date

  return (
    <Spin indicator={<Spinner loading />} spinning={loadingCounts}>
      <div className='w-full flex flex-row overflow-x-auto md:gap-3 gap-2  sm:flex-wrap'>
        <AlignerAnalyticsChart
          title='Patient compliance'
          labels={['Needs attention', 'At risk', 'On track']}
          backgroundColor={['#F45045', '#BE8901', '#00B383']}
          data={[needs_attention, at_risk, on_track]}
          CenterContent={
            <div className='flex flex-col justify-center items-center'>
              <div className='text-xl font-semibold'>{`${Math.round(on_track_percentage)}%`}</div>
              <div className='text-xs font-medium text-textColor'>{'On track'}</div>
            </div>
          }
          showInfo={true}
        />

        <AlignerAnalyticsChart
          title='Aligner changes till date'
          labels={['On time', 'Delay < 7 days', 'Delay > 7 days']}
          backgroundColor={['#00B383', '#BE8901', '#F45045']}
          data={[on_time, delay_less_than7_days, delay_more_than7_days]}
          CenterContent={
            <div className='flex flex-col justify-center items-center'>
              <div className='text-xl font-semibold'>{`${Math.round(on_time_percentage)}%`}</div>
              <div className='text-xs font-medium text-textColor'>{'On time'}</div>
            </div>
          }
        />

        <AlignerAnalyticsChart
          title='Aligner check-ins till date'
          labels={['Perfect fit', 'Some issues']}
          backgroundColor={['#00B383', '#F45045']}
          data={[perfect_fit, some_issue]}
          CenterContent={
            <div className='flex flex-col justify-center items-center'>
              <div className='text-xl font-semibold'>{`${Math.round(
                perfect_fit_percentage
              )}%`}</div>
              <div className='text-xs font-medium text-textColor'>{'Perfect fit'}</div>
            </div>
          }
        />

        <AlignerAnalyticsChart
          title='Issues reported till date'
          labels={['Missing aligner', 'Broken aligner', 'Irritation to gums', 'Sharp edges']}
          backgroundColor={['#F45045', '#F4504599', '#F450454D', '#F4504526']}
          data={[missing_aligner, broken_aligner, irritation_to_gums, sharp_edges]}
          CenterContent={
            <div className='flex flex-col justify-center items-center'>
              <div className='text-xl font-semibold'>
                {Math.round(total_issue_reported_percentage)}
              </div>
            </div>
          }
        />
      </div>
    </Spin>
  )
}

export default AlignerChartSection
