export default ({isCustomer = false, profileId}: {isCustomer: boolean; profileId: number}) => {
  return {
    case_type: isCustomer ? 'OUTSOURCE' : 'IN_HOUSE',
    assignee_id: profileId,
    category_id: null,
    product_service_id: null,
    production_option: 'DECIDE_AFTER_PLANNING',
  }
}
