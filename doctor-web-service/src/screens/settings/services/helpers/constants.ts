import type {OrgServicesState} from '../components/types'

export const sampleOrg: OrgServicesState = {
  services: {
    outsourced_aligners: false,
    in_house_aligners: false,
    planning: false,
    manufacturing: false,
    outsource_planning: false,
    outsource_manufacturing: false,
    operations_in_house: false,
    operations_outsource: false,
    offer_planning: false,
    offer_manufacturing: false,
  },
  alignerProducts: [],
  products: [],
  planningProducts: [],
  manufacturingProducts: [],
  planningPlans: [],
  outsourcePlanningPlans: [],
  outsourceManufacturingProducts: [],
}
