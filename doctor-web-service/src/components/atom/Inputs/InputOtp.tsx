import {FC, useState, useEffect} from 'react'
import OTPInput from 'react-otp-input'
import Label from '../Labels/LabelTitle'
import hasValue from '../../../utils/hasValue'

interface OtpInputProps {
  className?: string
  field?: any
  setOTP?: any
  onClick?: any
  wrongOTP?: boolean
  label?: string
}

const InputOtp: FC<OtpInputProps> = ({field, onClick, setOTP, wrongOTP, label}) => {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(300)

  const customInputStyle = !wrongOTP
    ? {
        border: '1px #D9D9D9 solid',
        borderRadius: '8px',
        width: '54px',
        height: '54px',
        fontSize: '12px',
        color: '#000',
        fontWeight: '400',
        caretColor: 'blue',
        marginLeft: '8px',
      }
    : {
        border: '1px #F45045 solid',
        borderRadius: '8px',
        width: '54px',
        height: '54px',
        fontSize: '12px',
        color: '#000',
        fontWeight: '400',
        caretColor: 'blue',
        marginLeft: '8px',
      }

  const [otp, setOtp] = useState('')
  useEffect(() => {
    setOTP(otp)
  }, [otp])

  useEffect(() => {
    const timerInterval = setInterval(() => {
      if (remainingSeconds === 0) {
        // Timer has reached 0, you can add your logic here
        clearInterval(timerInterval) // Clear the interval to stop the timer
      } else {
        setRemainingSeconds((prevSeconds) => prevSeconds - 1)
      }
    }, 1000)

    // Cleanup the interval on unmount
    return () => clearInterval(timerInterval)
  }, [remainingSeconds])

  // Calculate minutes and seconds
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60

  const resendOTP = () => {
    onClick()
    setRemainingSeconds(120)
  }

  const handleKeyDown = (e: any) => {
    // Allow only numeric characters and backspace
    if (!/^[0-9]$/.test(e?.key) && e?.key !== 'Backspace') {
      e.preventDefault()
    }
  }

  return (
    <div>
      <Label
        title={`Enter OTP ${hasValue(label) ? label : ''}`}
        className='text-textColor text-sm mx-1 font-medium'
      />
      <div className='flex snap-x'>
        <div className='flex-none w-200 mr-5'>
          <OTPInput
            {...field}
            value={otp}
            onChange={setOtp}
            numInputs={4}
            renderSeparator={<span> </span>}
            renderInput={(props) => (
              <input
                {...props}
                inputMode='numeric'
                onKeyDown={handleKeyDown}
                // You can add more input-related props here if needed
              />
            )}
            inputStyle={customInputStyle}
          />
        </div>
        <div className='flex-none w-100 h-54px mt-4'>
          {remainingSeconds !== 0 ? (
            <center className='text-sm'>{`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`}</center>
          ) : (
            <button
              className='text-textColor text-sm font-base underline cursor-pointer'
              type='button'
              disabled={remainingSeconds > 0}
              onClick={() => resendOTP()}
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default InputOtp
