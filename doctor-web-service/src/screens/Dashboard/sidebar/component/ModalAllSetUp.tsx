import {IMAGE_INVITE_PATIENT_SENT_SUCCESS} from '../../../../utils/ImageConst'
import Button from '../../../../components/atom/Buttons/Button'

interface propsSuccessModel {
  title: any
  onClickCall: () => void
}

const ModalAllSetUp: React.FC<propsSuccessModel> = (props) => {
  const {title, onClickCall} = props

  return (
    <div className='fixed left-0 top-0 z-[1055] h-full w-full flex justify-center items-center bg-black bg-opacity-40'>
      <div className='w-[528px] bg-white rounded-lg pb-10 shadow-lg px-12 py-9 pt-14'>
        <div className='flex justify-center mt-3'>
          <img className='w-[293.556px] h-[212.229px]' src={IMAGE_INVITE_PATIENT_SENT_SUCCESS} />
        </div>
        <div className="text-center mt-7 text-black text-xl font-semibold font-['Figtree']">
          {title}
        </div>
        <div className='mt-7'>
          <Button text={'Explore dashboard!'} onClick={() => onClickCall()} />
        </div>
      </div>
    </div>
  )
}

export default ModalAllSetUp
