interface props {
  title: string
  number: number
}
const StepperHeading = (props: props) => {
  const {title, number} = props
  return (
    <div className='flex w-full items-center justify-between'>
      <div className='flex items-center gap-2'>
        <div className='w-8 h-8 bg-primaryColor rounded-full flex justify-center items-center'>
          <div className='text-white text-xl font-semibold'>{number}</div>
        </div>
        <div className='text-black text-xl font-semibold'>{title}</div>
      </div>
    </div>
  )
}

export default StepperHeading
