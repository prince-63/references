export default () => {
  return {
    search: '',
    filter_by: 'ALL',
    sort_by: {
      label: 'Order created on, Newest to Oldest',
      value: {type: 'date', sort: 'desc'},
    },
  }
}
