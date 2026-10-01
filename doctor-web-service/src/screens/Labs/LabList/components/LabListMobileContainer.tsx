import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {Pagination, Spin} from 'antd'
import When from 'components/when/When'
import hasValue from 'utils/hasValue'
import NoLabFound from './NoLabFound'
import LabListItem from './LabListItem'
import {Invitation} from '../types/labs.types'
import practiceFilterConstants from '@constants/practiceFilter.constants'
import {useNavigate} from 'react-router-dom'
import {useContext, useMemo} from 'react'
import {AuthContext} from 'context/AuthContext'
import {safeParseInt} from 'utils/ConstFunctions'
import useAllUserPlan from '@hooks/useAllUserPlan'

const LabListMobileContainer = ({
  isAccessible,
  pageNumber,
  handleOnSearch,
  sendInvite,
  activeTab,
}: {
  isAccessible: boolean
  activeTab: keyof typeof practiceFilterConstants
  pageNumber: number
  handleOnSearch: ({page}: {page: number}) => void
  sendInvite: (lab: Invitation) => void
}) => {
  const {organizationId} = useContext(AuthContext)
  const {dataLabList, loadingLabList} = useSelector((state: RootState) => state.labs)
  const data = useMemo(() => dataLabList?.doctor_invitation_details_list ?? [], [dataLabList])
  const {isPractice} = useAllUserPlan()
  const practiceDataLabList = useMemo(
    () =>
      Array.isArray(data)
        ? data.filter((d) => d.organization_id === safeParseInt(organizationId))
        : [],
    [data, organizationId]
  )
  const targetData =
    activeTab === practiceFilterConstants.ACCEPTED && practiceDataLabList.length > 0
      ? practiceDataLabList
      : data

  const totalLabs =
    isPractice && activeTab === 'ACCEPTED' ? 1 : (dataLabList?.pagination?.total_patients ?? 0)

  const navigate = useNavigate()
  return (
    <Spin spinning={loadingLabList}>
      <div className='flex flex-col gap-3 mb-3'>
        <When isTrue={hasValue(dataLabList)}>
          {targetData?.map((lab) => (
            <LabListItem
              activeTab={activeTab}
              key={lab.invitation_id}
              lab={lab}
              sendInvite={sendInvite}
              isAccessible={isAccessible}
              onClick={() => {
                if (activeTab === 'ACCEPTED' && lab.profile_id) {
                  navigate(`/practice-lab-profile/${lab.profile_id}`, {state: lab})
                }
              }}
            />
          ))}
          <div className='flex justify-between mt-2 mb-2 md:px-2.5 px-1 items-center'>
            <p className='text-textColor text-sm font-medium'>
              {Math.min((pageNumber - 1) * 10 + 1, totalLabs)}-
              {Math.min(pageNumber * 10, totalLabs)} from {totalLabs}
            </p>
            <div className='md:hidden block'>
              <Pagination
                showSizeChanger={false}
                defaultCurrent={pageNumber}
                defaultPageSize={10}
                showLessItems
                onChange={(page) => {
                  handleOnSearch({
                    page,
                  })
                }}
                total={totalLabs}
              />
            </div>
            <div className='hidden md:block'>
              <Pagination
                showSizeChanger={false}
                defaultCurrent={pageNumber}
                defaultPageSize={10}
                onChange={(page) => {
                  handleOnSearch({
                    page,
                  })
                }}
                total={totalLabs}
              />
            </div>
          </div>
        </When>

        <When isTrue={!hasValue(dataLabList)}>
          <NoLabFound />
        </When>
      </div>
    </Spin>
  )
}

export default LabListMobileContainer
