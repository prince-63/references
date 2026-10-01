const ReportIcon = ({color, className}: {color: string; className?: string}) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='20'
      viewBox='0 0 20 20'
      fill='none'
      className={className}
    >
      <g clipPath='url(#clip0_9853_25123)'>
        <path
          d='M10 13.125V17.5'
          stroke={color || '#666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M3.50482 6.25C2.67934 7.67978 2.34869 9.34199 2.56416 10.9788C2.77963 12.6157 3.52917 14.1357 4.69655 15.3031C5.86393 16.4706 7.38389 17.2202 9.02073 17.4358C10.6576 17.6514 12.3198 17.3208 13.7496 16.4954C15.1794 15.67 16.297 14.3959 16.9289 12.8706C17.5608 11.3454 17.6718 9.65426 17.2446 8.05951C16.8175 6.46476 15.876 5.05551 14.5663 4.05033C13.2567 3.04515 11.6519 2.5002 10.0009 2.5V6.875C10.6888 6.87515 11.3574 7.10228 11.9031 7.52114C12.4487 7.94001 12.8409 8.52722 13.0189 9.1917C13.1968 9.85618 13.1505 10.5608 12.8872 11.1963C12.6238 11.8318 12.1582 12.3626 11.5624 12.7065C10.9666 13.0504 10.2741 13.1881 9.59206 13.0982C8.91006 13.0084 8.27676 12.696 7.79038 12.2096C7.30399 11.7231 6.9917 11.0898 6.90194 10.4078C6.81217 9.7258 6.94994 9.03323 7.29388 8.4375L3.50482 6.25Z'
          stroke={color || '#666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M6.98047 10.8093L2.75391 11.9414'
          stroke={color || '#666'}
          strokeWidth='1.25'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id='clip0_9853_25123'>
          <rect width='20' height='20' fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default ReportIcon
