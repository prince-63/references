import {Product} from 'screens/Kanban/screens/ProductionSetup/SelectTaskManufacturingType'

export type Plan = {
  id: string
  name: string
  description?: string
  price: number
  createdAt: string
}

export enum ServicesTabs {
  OVERVIEW = 'OVERVIEW',
  PRODUCTS_AND_SERVICES = 'PRODUCTS_AND_SERVICES',
}

export interface OrgServicesState {
  services: {
    outsourced_aligners: boolean
    in_house_aligners: boolean
    planning: boolean
    manufacturing: boolean
    outsource_planning: boolean
    outsource_manufacturing: boolean
    operations_in_house: boolean
    operations_outsource: boolean
    offer_planning: boolean
    offer_manufacturing: boolean
  }
  alignerProducts: Product[]
  products: Product[]
  planningProducts: Product[]
  manufacturingProducts: Product[]
  planningPlans: Plan[]
  outsourcePlanningPlans: Plan[]
  outsourceManufacturingProducts: Product[]
}

// Types for better type safety
export interface FeatureCardProps {
  title: string
  description: string
  is_active: boolean
  callChangeStatus: () => void
}

export interface FeatureItemProps {
  data: string
}

export interface FeatureDetailsProps {
  title: string
  is_active: boolean
}
