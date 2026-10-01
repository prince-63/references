import orderSortingConstants from '@constants/orderSorting.constants'
import {IOptionTypeOrderSort} from 'screens/Orders/components/Sort'

export default [
  {
    label: 'Order created on, Newest to Oldest',
    value: orderSortingConstants.ORDER_CREATED_NEW_TO_OLD,
    valueOption: {
      type: 'date',
      sort: 'desc',
    },
  },
  {
    label: 'Order created on, Oldest to Newest',
    value: orderSortingConstants.ORDER_CREATED_OLD_TO_NEW,
    valueOption: {
      type: 'date',
      sort: 'asc',
    },
  },
  {
    label: 'Last updated, Newest to Oldest',
    value: orderSortingConstants.LAST_UPDATED_NEW_TO_OLD,
    valueOption: {
      type: 'lastUpdated',
      sort: 'desc',
    },
  },
  {
    label: 'Last updated, Oldest to Newest',
    value: orderSortingConstants.LAST_UPDATED_OLD_TO_NEW,
    valueOption: {
      type: 'lastUpdated',
      sort: 'asc',
    },
  },
  {
    label: 'Patient name, Ascending',
    value: orderSortingConstants.NAME_ASC,
    valueOption: {
      type: 'patientName',
      sort: 'desc',
    },
  },
  {
    label: 'Patient name, Descending',
    value: orderSortingConstants.NAME_DEC,
    valueOption: {
      type: 'patientName',
      sort: 'asc',
    },
  },
] as IOptionTypeOrderSort[]
