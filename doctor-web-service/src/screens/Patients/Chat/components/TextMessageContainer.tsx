import CommonSVG from '../../../../components/atom/SVG/CommonSVG'
import Spinner from '../../../../components/spinner/Spinner'
import When from '../../../../components/when/When'
import {SVG_SEND} from '../../../../utils/SvgConstants'

const TextMessageContainer: React.FC<{
  message: string
  onChangeMessageTyping: (x: string) => void
  handleKeyMessageFunctions: (e: any) => void
  chatSend: () => void
  messageSending: boolean
}> = ({message, onChangeMessageTyping, handleKeyMessageFunctions, chatSend, messageSending}) => {
  return (
    <div className='w-full sticky bottom-0 rounded-lg border-2 border-mediumGray flex p-3 bg-white'>
      <textarea
        className='text-textColor text-sm font-normal w-full border-none outline-none'
        placeholder='Type a message'
        value={message}
        onChange={(e) => onChangeMessageTyping(e.target.value)}
        onKeyDown={handleKeyMessageFunctions}
        maxLength={5000}
        minLength={2}
      />
      <When isTrue={messageSending}>
        <Spinner {...{loading: messageSending}} />
      </When>
      <When isTrue={!messageSending}>
        <button onClick={() => chatSend()}>
          <CommonSVG svg={SVG_SEND} width='24' height='24' />
        </button>
      </When>
    </div>
  )
}

export default TextMessageContainer
