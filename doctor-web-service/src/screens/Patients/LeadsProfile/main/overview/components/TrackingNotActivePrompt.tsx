import ArrowRight from 'assets/icons/ArrowRight'
import InfoIcon from 'assets/icons/InfoIcon'
import clsx from 'clsx'
import Button from 'components/atom/Buttons/Button'
import getColorPalette from 'utils/getColorPalette'

const OverviewPrompt = ({
  title,
  text,
  type,
  buttonText,
  handleTakeMeThereClick,
}: {
  title: string
  text: string
  buttonText?: string
  type: 'primary' | 'warning'
  handleTakeMeThereClick: () => void
}) => {
  return (
    <div
      className={clsx(
        'w-full rounded-lg border px-3 py-4 pe-6 flex flex-col  md:flex-row  justify-start items-start md:justify-between md:items-center gap-4',
        type === 'primary' ? 'border-primaryColor bg-primarySupport' : 'border-red'
      )}
    >
      <div className='flex  gap-2 items-start'>
        <div className='flex-[1] flex items-center justify-center'>
          <InfoIcon
            color={type === 'warning' ? '#F45045' : getColorPalette().primaryColor}
            height='28'
            width='28'
          />
        </div>
        <div className='flex-[15] flex flex-col gap-1'>
          <p
            className={clsx(
              'text-lg font-bold',
              type === 'primary' ? 'text-primaryColor' : 'text-red'
            )}
          >
            {title}
          </p>
          <p className='text-textColor'>{text}</p>
        </div>
      </div>
      <div className='flex items-center justify-center ml-10'>
        <Button
          text={buttonText || 'Take me there'}
          onClick={handleTakeMeThereClick}
          className={clsx(
            '!w-fit px-4 border border-red bg-redSupport',
            type === 'primary' && '!border-primaryColor !bg-primarySupport'
          )}
          textStyle={type === 'primary' ? '!text-primaryColor' : '!text-red'}
          SvgRight={
            <ArrowRight
              color={type === 'warning' ? '#F45045' : getColorPalette().primaryColor}
              height='13'
              width='18'
            />
          }
        />
      </div>
    </div>
  )
}

export default OverviewPrompt
