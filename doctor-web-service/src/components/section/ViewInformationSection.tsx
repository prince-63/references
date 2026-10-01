import When from 'components/when/When'

interface IViewInformationSection {
  title: React.ReactNode
  children: React.ReactNode
  showBorder?: boolean
}
const ViewInformationSection = ({title, children, showBorder = true}: IViewInformationSection) => {
  return (
    <div className='flex flex-col gap-3'>
      <p className='font-semibold text-xl'>{title}</p>

      <When isTrue={showBorder}>
        <div className='w-full border border-lightGray mb-1 mx-1'></div>
      </When>
      {children}
    </div>
  )
}

export default ViewInformationSection
