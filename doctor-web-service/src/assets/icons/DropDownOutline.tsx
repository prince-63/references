const DropDownOutline = ({...props}) => {
  return (
    <svg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M11.2847 1.31181C11.0053 1.03241 10.5523 1.03241 10.2729 1.31181L5.90833 5.67638C5.62893 5.95578 5.62893 6.40878 5.90834 6.68818C6.18774 6.96758 6.64073 6.96758 6.92013 6.68818L11.2847 2.32361C11.5641 2.04421 11.5641 1.59121 11.2847 1.31181Z'
        fill={props.color || '#735BF2'}
        {...props}
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M1.46041 1.31181C1.73981 1.03241 2.19281 1.03241 2.47221 1.31181L6.83678 5.67638C7.11618 5.95578 7.11618 6.40878 6.83678 6.68818C6.55738 6.96758 6.10439 6.96758 5.82498 6.68818L1.46041 2.32361C1.18101 2.04421 1.18101 1.59121 1.46041 1.31181Z'
        fill={props.color || '#735BF2'}
      />
    </svg>
  )
}

export default DropDownOutline
