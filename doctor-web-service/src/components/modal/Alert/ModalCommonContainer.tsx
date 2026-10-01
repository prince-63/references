import Button from '../../atom/Buttons/Button'
import {useNavigate} from 'react-router-dom'

interface propsSuccessModel {
  setIsSuccessModelOpen: (successModelOpen: boolean) => void
  img?: string
  title1: string
  title2?: string
  subtitle: string
  buttonTitle: string
}

const ModalCommonContainer: React.FC<propsSuccessModel> = (props) => {
  const {setIsSuccessModelOpen, img, title1, title2, subtitle, buttonTitle} = props
  const navigate = useNavigate()

  const callSuccessModel = () => {
    setIsSuccessModelOpen(false)
    navigate('/new-patients')
  }

  return (
    <div className='fixed left-0 top-0 z-[1055] h-full w-full min-w-[35%] max-h-[98%] flex justify-center items-center bg-black bg-opacity-40 overflow-auto'>
      <div className='min-w-[34%] bg-white rounded-lg p-6 shadow-lg'>
        <div className='flex justify-center'>
          <img className='w-[205px]' src={img} />
        </div>
        <div className='text-center text-black text-2xl font-semibold leading-normal mt-9'>
          {title1}
        </div>
        <div className='text-center text-black text-2xl font-semibold leading-normal'>{title2}</div>
        <p className='text-center text-textColor text-base font-medium mt-3'>{subtitle}</p>
        <div className='mt-4'>
          <Button
            text={buttonTitle}
            onClick={() => callSuccessModel()}
            className={'h-11 mb-6 mt-2'}
          />
        </div>
      </div>
    </div>
  )
}

export default ModalCommonContainer
