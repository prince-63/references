import clsx from 'clsx'
import {FC} from 'react'
import {ClipLoader} from 'react-spinners'
import getColorPalette from 'utils/getColorPalette'
interface Props {
  className?: string
  loading: boolean
  size?: number
  color?: string
}
const Spinner: FC<Props> = ({className, loading, size, color = getColorPalette().primaryColor}) => {
  return (
    <div className={clsx(className, 'flex justify-center items-center')}>
      <ClipLoader color={color} loading={loading} size={size} speedMultiplier={0.75} />
    </div>
  )
}

export default Spinner
