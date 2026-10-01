import CaretRightIcon from 'assets/icons/CaretRightIcon'
import getColorPalette from 'utils/getColorPalette'

const AddNewButton = ({text, onClick}: {text: string; onClick: () => void}) => {
  return (
    <button
      className='flex gap-2 text-primaryColor items-center font-semibold'
      type='button'
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      {text}
      <CaretRightIcon color={getColorPalette().primaryColor} width='7' height='10' />
    </button>
  )
}

export default AddNewButton
