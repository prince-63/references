import {Spin} from 'antd'
import CaseHistory from 'components/CaseHistory/CaseHistory'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'

/* ─────────── Component ─────────── */

const CaseHistoryCard = () => {
  const {getAuditLogsList, loadingCardConfiguration} = useSelector(
    (state: RootState) => state.workFlow
  )

  return (
    <Spin spinning={loadingCardConfiguration}>
      <CaseHistory activities={getAuditLogsList} />
    </Spin>
  )
}

export default CaseHistoryCard
