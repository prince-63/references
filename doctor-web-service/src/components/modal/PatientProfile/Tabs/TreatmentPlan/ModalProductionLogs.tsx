import BackGroundSVG from '../../../../atom/SVG/BackGroundSVG'
import {SVG_CROSS, SVG_TEETHS} from '../../../../../utils/SvgConstants'
import {setProductionLogsModelOpen} from '../../../../../redux/Slices/AppSlice/PatientProfile/TreatmentPlan/TreatmentPlan'
import CommonSVG from '../../../../atom/SVG/CommonSVG'
import {useDispatch, useSelector} from 'react-redux'
import {Image} from '../../../../../assets/images/Images/Image'
import {IMAGE_INVITE_PATIENT_SENT_SUCCESS} from '../../../../../utils/ImageConst'
import {StatusChanges} from './StatusChanges'
import {RootState} from '../../../../../redux/store'
import hasValue from '../../../../../utils/hasValue'
import {formatTime} from '../../../../../utils/ConstFunctions'
import moment from 'moment'
import When from '../../../../when/When'
import {useEffect} from 'react'
import {postApiDataProductionLog} from '../../../../../redux/Slices/AppSlice/PatientProfile/TreatmentPlan/ProductionLogSlice'
import {ActionItem} from 'screens/Patients/LeadsProfile/leadsProfile.types'
import actionTypes from '@constants/actionTypes'
interface AlignerLog {
  aligner_nos: number[]
  logged_at: string
  old_production_sub_status: string
  new_production_sub_status: string
  old_aligner_production_lab: string
  new_aligner_production_lab: string
}

interface OrderLogs {
  [date: string]: AlignerLog[]
}

interface Data {
  aligner_journey_id: number
  order_logs: OrderLogs
}

const ModalProductionLogs = ({
  handleOnClose,
  alignerJourneyId,
}: {
  handleOnClose?: (option: ActionItem) => void
  alignerJourneyId?: number | undefined | null
}) => {
  const dispatch = useDispatch()

  const {data: dataProductionLogsList, loading: loadingProductionLogsList}: any = useSelector(
    (state: RootState) => state.apiProductionLog
  )

  useEffect(() => {
    getProductionLogsData()
  }, [])

  const getProductionLogsData = () => {
    const postData: any = {
      data: {
        aligner_journey_id: alignerJourneyId,
      },
    }
    dispatch(postApiDataProductionLog(postData) as any)
  }

  const groupWiseDatesWithData = hasValue(dataProductionLogsList)
    ? transformData(dataProductionLogsList)
    : []

  function transformData(data: Data): Record<string, Record<string, AlignerLog[]>> {
    const transformedData: Record<string, Record<string, AlignerLog[]>> = {}

    for (const [date, logs] of Object.entries(data.order_logs)) {
      const [year, month, day] = date.split('-')
      const formattedMonthYear = `${moment(`${year}-${month}-01`).format('MMMM YYYY')}`
      const formattedDate = `${day} ${moment(`${year}-${month}-${day}`).format('MMMM')}`

      if (!transformedData[formattedMonthYear]) {
        transformedData[formattedMonthYear] = {}
      }

      transformedData[formattedMonthYear][formattedDate] = logs
    }

    return transformedData
  }

  return (
    <div
      className='fixed left-0 top-0 z-[1055] h-full w-full flex justify-center items-center bg-black bg-opacity-40'
      tabIndex={-1}
    >
      <div className=' bg-white w-auto rounded-lg p-6 shadow-lg  min-w-[45%] '>
        <div className='flex justify-between items-center '>
          <BackGroundSVG
            svg={SVG_TEETHS}
            width='26'
            height='26'
            className='w-16 h-16 bg-primarySupport rounded-full'
          />
          <div
            className='cursor-pointer'
            onClick={() => {
              dispatch(setProductionLogsModelOpen(false))
              handleOnClose && handleOnClose(actionTypes.VIEW_LOGS)
            }}
          >
            <CommonSVG svg={SVG_CROSS} width='47' height='47' />
          </div>
        </div>
        <div className='mt-4'>
          <div className='text-black text-2xl font-semibold'>Production log</div>
          <div className='mt-2 h-5 text-textColor text-base font-normal'>
            You can view the details of all the status changes you've made here
          </div>
        </div>
        {loadingProductionLogsList ? (
          <center className='pt-10'>Loading...</center>
        ) : (
          <>
            <When isTrue={!hasValue(dataProductionLogsList?.order_logs)}>
              <div className=''>
                <div className='flex justify-center'>
                  <Image src={IMAGE_INVITE_PATIENT_SENT_SUCCESS} className='my-3 w-[300px]' />
                </div>
                <p className='mt-2 text-center text-textColor text-base'>
                  Move aligners through the production pipeline by changing their status.
                </p>
                <p className='text-center text-textColor text-base'>
                  Once you update the status, it will be displayed here.
                </p>
              </div>
            </When>
            <When isTrue={hasValue(dataProductionLogsList?.order_logs)}>
              <div className='mt-5 max-h-96 overflow-auto'>
                {Object.entries(groupWiseDatesWithData).map(([monthYear, dates]) => (
                  <ol className='ml-2' key={monthYear}>
                    <div className='text-lg font-semibold text-textColor'>{monthYear}</div>
                    {Object.entries(dates).map(([date, logs]) => (
                      <div className='my-4' key={date}>
                        <div className='text-base font-semibold me-2'>{date}</div>
                        {logs.map((log: AlignerLog, index: number) => (
                          <li
                            className={`ml-2 mt-2 ${
                              index !== logs.length - 1
                                ? 'border-l-2 border-dashed border-textColor '
                                : 'pl-[2px]'
                            }`}
                            key={index}
                          >
                            <StatusChanges
                              changedFrom={log.old_production_sub_status}
                              changedTo={log.new_production_sub_status}
                              createdTime={formatTime(log.logged_at)}
                              alignerNoArray={log.aligner_nos}
                              oldBrand={log.old_aligner_production_lab}
                              newBrand={log.new_aligner_production_lab}
                            />
                          </li>
                        ))}
                      </div>
                    ))}
                  </ol>
                ))}
              </div>
            </When>
          </>
        )}
      </div>
    </div>
  )
}

export default ModalProductionLogs
