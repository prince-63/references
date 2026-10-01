import {Spin} from 'antd'
import VspCaseHistory from './VspCaseHistory'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'

/* ─────────── Component ─────────── */

const VspCaseHistoryCard = () => {
  const {getAuditLogsList, loadingCardConfiguration} = useSelector(
    (state: RootState) => state.workFlow
  )

  return (
    <Spin spinning={loadingCardConfiguration}>
      <VspCaseHistory activities={getAuditLogsList} />
    </Spin>
  )
}

export default VspCaseHistoryCard
