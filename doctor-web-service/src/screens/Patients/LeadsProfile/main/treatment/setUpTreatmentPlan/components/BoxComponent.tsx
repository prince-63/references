type BoxComponentProps = {
  option: number
  selectedBoxes: number[]
  handleBoxClick: (option: number, isUpper: boolean) => void
  className?: string
  isUpperJaw: boolean
}

const BoxComponent: React.FC<BoxComponentProps> = ({
  option,
  selectedBoxes,
  handleBoxClick,
  className = 'bg-secondarySupport text-secondaryColor border border-secondaryColor',
  isUpperJaw,
}) => {
  return (
    <div
      className={`w-11 h-11 md:w-12 md:h-12 border rounded-lg flex items-center justify-center cursor-pointer  mr-1.5 mt-1.5 text-base font-bold text-grayDisabled
      ${selectedBoxes.includes(option) ? className : ''}`}
      onClick={() => handleBoxClick(option, isUpperJaw)}
    >
      {option}
    </div>
  )
}
export default BoxComponent
