import Page from 'components/page/Page'
import {useEffect, useState} from 'react'
import {TimelinePart} from './components/TimelinePart'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  PostDataTimeLine,
  postApiDataAllTimeline,
} from 'redux/Slices/AppSlice/PatientProfile/Timeline/AllTimelineSlice'
import {useParams} from 'react-router-dom'
import {safeParseInt} from 'utils/ConstFunctions'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'

export interface IEventType {
  filteredAllEvents: any[]
  filteredAlignerChangeEvents: any[]
}

export interface FormValuesTimeline {
  noteTitle: string
  noteText: string
}

const Timeline = () => {
  const {dispatchAction} = useDispatchAction()
  const {patientId} = useParams()
  const [allTimelineData, setAllTimelineData] = useState<IEventType>({
    filteredAllEvents: [],
    filteredAlignerChangeEvents: [],
  })
  const {dataLeadsOverview} = useSelector((state: RootState) => state.leadsProfile)
  const {loadingTimelineList} = useSelector((state: RootState) => state.apiAllTimeline)

  const isBracesOnly = dataLeadsOverview?.product_type_names?.every((name) => name !== 'ALIGNERS')

  useEffect(() => {
    getAllTimeline()
  }, [])

  const getAllTimeline = () => {
    const postData: PostDataTimeLine = {
      patientId: safeParseInt(patientId),
    }
    dispatchAction(postApiDataAllTimeline(postData))
      .unwrap()
      .then((res: IEventType) => {
        setAllTimelineData(res)
      })
      .catch((error: any) => {
        console.error(error)
      })
  }

  return (
    <Page title='Treatment timeline' showBorder={true} loading={loadingTimelineList}>
      <TimelinePart allTimelineData={allTimelineData} isBracesOnly={isBracesOnly} />
    </Page>
  )
}

export default Timeline
