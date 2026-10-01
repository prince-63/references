import {useEffect, useState} from 'react'
import Select from 'react-select'
import AllALignerBarChart from '../../../../components/modal/PatientProfile/Tabs/WearStats/AllALignerBarChart'
import AlignerWiseBarChart from '../../../../components/modal/PatientProfile/Tabs/WearStats/AlignerWiseBarChart'
import {
  ApiGetData,
  capitalizeFirstLetter,
  formatPluralizedString,
  getFormattedWearTime,
  getValueOrEmptyString,
  identifyUser,
  secToHour,
} from '../../../../utils/ConstFunctions'
import {useDispatch, useSelector} from 'react-redux'
import {RootState} from '../../../../redux/store'
import useProfileBasePath from '@hooks/useProfileBasePath'
import {
  clearDataAllAlignerWearStats,
  postApiDataAllAlignerWearStats,
} from '../../../../redux/Slices/AppSlice/PatientProfile/WearStats/AllAlignerWearStatsSlice'
import {
  clearDataAlignerWiseWearStats,
  postApiDataAlignerWiseWearStats,
} from '../../../../redux/Slices/AppSlice/PatientProfile/WearStats/AlignerWiseWearStatsSlice'
import moment from 'moment'
import {useParams} from 'react-router-dom'
import CommonSVG from '../../../../components/atom/SVG/CommonSVG'
import {
  SVG_BACKWARD,
  SVG_FORWARD,
  SVG_LAYERS,
  SVG_TEETHS_GREEN,
  SVG_TIMER_ORANGE,
  SVG_TIMER_PRIMARY,
} from '../../../../utils/SvgConstants'
import BorderedCard from 'components/BorderedCard/BorderedCard'
import Page from 'components/page/Page'

const WearStats = () => {
  const dispatch = useDispatch()
  const {patientId, alignerJourneyId} = useParams()
  const profileBasePath = useProfileBasePath()
  const [allAlignerWearStats, setAllAlignerWearStats] = useState<any>({})
  const [alignerWiseWearStats, setAlignerWiseWearStats] = useState<any>({})
  const [totalAlignerOptions, setTotalAlignerOptions] = useState<any>([])
  const [allAlignerChartData, setAllAlignerChartData] = useState<any>({
    data: [],
    label: [],
  })
  const [alignerWiseChartData, setAlignerWiseChartData] = useState<any>({data: [], label: []})
  const [setSelectedAlignerOption, setSetSelectedAlignerOption] = useState({
    label: `All Aligner`,
    value: 'AllAligner',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [currentPage1, setCurrentPage1] = useState(1)
  const [totalColumns, setTotalColumns] = useState(14)
  const [totalColumns1, setTotalColumns1] = useState(14)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    getAllAlignerDetails()
    getAlignerWiseDetails(1)
  }, [])

  const {loading: loadingAllAlignerDetails, data: dataAllAlignerDetails} = useSelector(
    (state: RootState) => state.apiAllAlignerWearStats
  )

  // All Aligner API call
  const getAllAlignerDetails = () => {
    const postData: ApiGetData = {
      data: {
        patient_id: patientId,
        alignerJourneyId: alignerJourneyId,
      },
    }
    dispatch(postApiDataAllAlignerWearStats(postData) as any)
  }
  useEffect(() => {
    if (dataAllAlignerDetails != null && !loadingAllAlignerDetails) {
      const data: any = dataAllAlignerDetails
      const list: any = []
      const listAllAlignerChartData: any = []
      const listAllAlignerChartLabel: any = []
      setTotalColumns(data?.aligners?.length)
      setAllAlignerWearStats(data)
      data?.aligners.forEach((element: any, index: number) => {
        if (index === 0) {
          list.push({label: `All Aligner`, value: 'AllAligner'})
        }
        listAllAlignerChartData.push(secToHour(element.avg_wear_time_in_secs))
        listAllAlignerChartLabel.push(element.sr_no)

        list.push({label: `Aligner ${element.sr_no}`, value: element.sr_no})
      })
      setAllAlignerChartData({
        data: listAllAlignerChartData,
        label: listAllAlignerChartLabel,
      })
      setTotalAlignerOptions(list)
    }
    dispatch(clearDataAllAlignerWearStats)
  }, [dataAllAlignerDetails, loadingAllAlignerDetails])

  // Aligner wise data APi call
  const {loading: loadingAlignerWiseDetails, data: dataAlignerWiseDetails} = useSelector(
    (state: RootState) => state.apiAlignerWiseWearStats
  )

  const getAlignerWiseDetails: any = (alignerNumber: any) => {
    const postData: ApiGetData = {
      data: {
        patient_id: patientId,
        aligner_no: alignerNumber,
        alignerJourneyId: alignerJourneyId,
      },
    }
    dispatch(postApiDataAlignerWiseWearStats(postData) as any)
  }
  useEffect(() => {
    if (dataAlignerWiseDetails != null && !loadingAlignerWiseDetails) {
      const data: any = dataAlignerWiseDetails
      const listAlignerChartData: any = []
      const listAlignerChartLabel: any = []
      setTotalColumns1(data?.daily_wear_time_details?.length)
      setStartDate(moment(data?.daily_wear_time_details[0].date).format('MMM DD'))
      setEndDate(
        moment(data?.daily_wear_time_details[data?.daily_wear_time_details.length - 1].date).format(
          'MMM DD'
        )
      )
      data.daily_wear_time_details.forEach((element: any) => {
        listAlignerChartData.push(secToHour(element.total_wear_time_in_sec))
        listAlignerChartLabel.push(moment(element.date).format('MMM DD'))
      })
      setAlignerWiseChartData({
        data: listAlignerChartData,
        label: listAlignerChartLabel,
      })
      setAlignerWiseWearStats(data)
    }
    dispatch(clearDataAlignerWiseWearStats)
  }, [dataAlignerWiseDetails, loadingAlignerWiseDetails])

  const setAlignerOption = (selectedOption: any) => {
    setCurrentPage(1)
    if (selectedOption.value !== 'AllAligner') {
      getAlignerWiseDetails(selectedOption?.value)
    } else {
      getAllAlignerDetails()
    }
    identifyUser()
    setSetSelectedAlignerOption(selectedOption)
  }

  const columnsPerPage = 14
  const startIndex = (currentPage - 1) * columnsPerPage
  const endIndex = startIndex + columnsPerPage
  // all aligner forward back
  const handleNextPage = () => {
    if (currentPage < Math.ceil(totalColumns / columnsPerPage)) {
      setCurrentPage((prevPage) => prevPage + 1)
    }
  }
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1)
    }
  }

  // aligner wise forward back
  const columnsPerPageAlignerWise = 14
  const startIndex1 = (currentPage1 - 1) * columnsPerPageAlignerWise
  const endIndex1 = startIndex1 + columnsPerPageAlignerWise
  const handleNextPageAligner = () => {
    if (currentPage1 < Math.ceil(totalColumns1 / columnsPerPageAlignerWise)) {
      setCurrentPage1((prevPage) => prevPage + 1)
    }
  }

  const handlePrevPageAligner = () => {
    if (currentPage1 > 1) {
      setCurrentPage1((prevPage) => prevPage - 1)
    }
  }

  useEffect(() => {
    const data = alignerWiseChartData.label.slice(startIndex1, endIndex1)
    setStartDate(data[0])
    setEndDate(data[data.length - 1])
  }, [currentPage1])

  return (
    <Page
      title={'Wear stats'}
      showBackButton={true}
      showBorder={true}
      backNavigationRoute={`${profileBasePath}/${patientId}/aligner-tracking`}
      containerClassName='overflow-x-hidden pb-4'
    >
      <BorderedCard>
        <div className='container mx-auto p-4'>
          <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='h-36 bg-white rounded-lg shadow p-4'>
              <div className='w-11 h-11 p-2 bg-primarySupport rounded-lg justify-center items-center gap-2 inline-flex'>
                <CommonSVG svg={SVG_LAYERS} width='18' height='18' />
              </div>
              <div className='text-textColor text-sm font-medium mt-4'>
                Current aligner compliance
              </div>
              <div className='text-black text-xl font-semibold '>
                {capitalizeFirstLetter(
                  getValueOrEmptyString(
                    setSelectedAlignerOption.value === 'AllAligner'
                      ? allAlignerWearStats?.current_aligner_compliance
                      : alignerWiseWearStats.current_aligner_compliance
                  )
                )}
              </div>
            </div>
            <div className='h-36 bg-white rounded-lg shadow p-4'>
              <div className='w-11 h-11 p-2 bg-tertiarySupport rounded-lg justify-center items-center gap-2 inline-flex'>
                <CommonSVG svg={SVG_TEETHS_GREEN} width='22' height='22' />
              </div>
              <div className='text-textColor text-sm font-medium mt-4'>Current aligner</div>
              <div className='text-black text-xl font-semibold '>
                {capitalizeFirstLetter(
                  getValueOrEmptyString(allAlignerWearStats?.current_aligner_jaw_type)
                )}{' '}
                {allAlignerWearStats?.current_aligner_no}
              </div>
            </div>
            <div className='h-36 bg-white rounded-lg shadow p-4'>
              <div className='w-11 h-11 p-2 bg-primarySupport rounded-lg justify-center items-center gap-2 inline-flex'>
                <CommonSVG svg={SVG_TIMER_PRIMARY} width='22' height='22' />
              </div>
              <div className='text-textColor text-sm font-medium mt-4'>Average wear time</div>
              <div className='text-black text-xl font-semibold '>
                {getFormattedWearTime(
                  setSelectedAlignerOption,
                  allAlignerWearStats,
                  alignerWiseWearStats
                )}
              </div>
            </div>
            <div className='h-36 bg-white rounded-lg shadow p-4'>
              <div className='w-11 h-11 p-2 bg-lightOrange rounded-lg justify-center items-center gap-2 inline-flex'>
                <CommonSVG svg={SVG_TIMER_ORANGE} width='22' height='22' />
              </div>
              <div className='text-textColor text-sm font-medium mt-4'>Recommended wear time</div>
              <div className='text-black text-xl font-semibold '>
                {formatPluralizedString(
                  allAlignerWearStats?.recommended_hours_to_wear_aligners,
                  'Hour'
                )}
              </div>
            </div>
          </div>
        </div>
        <div className='flex flex-wrap gap-4 justify-between px-10 md:mt-10  mt-4'>
          {setSelectedAlignerOption.value === 'AllAligner' ? (
            <div className='flex md:justify-start justify-center gap-3 items-center '>
              <button className='px-3' onClick={() => handlePrevPage()}>
                <CommonSVG svg={SVG_BACKWARD} width='44' height='44' />
              </button>
              <span className='text-center text-black text-base font-medium'>
                Aligners {startIndex + 1} - {Math.min(endIndex, totalColumns)}
              </span>
              <button className='px-3' onClick={() => handleNextPage()}>
                <CommonSVG svg={SVG_FORWARD} width='44' height='44' />
              </button>
            </div>
          ) : (
            <div className='flex gap-3 items-center '>
              <button className='px-3' onClick={() => handlePrevPageAligner()}>
                <CommonSVG svg={SVG_BACKWARD} width='44' height='44' />
              </button>
              <span className='text-center text-black text-base font-medium'>
                {startDate} - {endDate}
              </span>
              <button className='px-3' onClick={() => handleNextPageAligner()}>
                <CommonSVG svg={SVG_FORWARD} width='44' height='44' />
              </button>
            </div>
          )}

          <div className='md:w-fit w-full'>
            <Select
              options={totalAlignerOptions}
              value={setSelectedAlignerOption}
              onChange={(selectedOption: any) => setAlignerOption(selectedOption)}
            />
          </div>
        </div>
        <div className=''>
          {setSelectedAlignerOption.value === 'AllAligner' ? (
            <AllALignerBarChart
              chartData={allAlignerChartData.data.slice(startIndex, endIndex)}
              labelData={allAlignerChartData.label.slice(startIndex, endIndex)}
              recommendedHours={allAlignerWearStats?.recommended_hours_to_wear_aligners}
            />
          ) : (
            <AlignerWiseBarChart
              chartData={alignerWiseChartData.data.slice(startIndex1, endIndex1)}
              labelData={alignerWiseChartData.label.slice(startIndex1, endIndex1)}
              recommendedHours={allAlignerWearStats?.recommended_hours_to_wear_aligners}
            />
          )}
        </div>
      </BorderedCard>
    </Page>
  )
}

export default WearStats
