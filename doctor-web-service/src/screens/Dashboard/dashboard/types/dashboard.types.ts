import dashboardTypesList from '@staticData/dashboardTypesList'

export type DashboardTypeListItem = (typeof dashboardTypesList)[number]
export type DashboardViewTypeFilter = Record<DashboardTypeListItem['value'], boolean>
export type EditLabelFormType = {
  home: string
  customer_view: string
  workspace: string
  lab_view: string
}
