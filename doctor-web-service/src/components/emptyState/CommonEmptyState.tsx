import clsx from 'clsx'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import When from 'components/when/When'
import React from 'react'
import hasValue from 'utils/hasValue'
interface props {
  boxStyle?: string
  image?: any
  imageStyle?: string
  title?: string
  titleStyle?: string
  subTitle?: string
  subTitleStyle?: string
  buttonText?: string | null
  buttonIcon?: any
  buttonStyle?: string
  buttonIconWidth?: string
  buttonIconHeight?: string
  onClick?: () => void
}
const CommonEmptyState = (props: props) => {
  const {
    image,
    boxStyle,
    imageStyle,
    title,
    titleStyle,
    subTitle,
    subTitleStyle,
    buttonText,
    buttonIcon,
    buttonStyle,
    buttonIconWidth,
    buttonIconHeight,
    onClick,
  } = props
  return (
    <div className={clsx('flex flex-col justify-center items-center', boxStyle)}>
      {hasValue(image) && (
        <img src={image} alt='' width={'258px'} height={'216px'} className={clsx(imageStyle)} />
      )}
      <When isTrue={hasValue(title)}>
        <div className={clsx(titleStyle)}>{title}</div>
      </When>
      <When isTrue={hasValue(subTitle)}>
        <div className={clsx('text-textColor ', subTitleStyle)}>{subTitle}</div>
      </When>
      <When isTrue={hasValue(buttonText)}>
        <button
          type='button'
          className={clsx('flex gap-2 justify-center items-center', buttonStyle)}
          onClick={onClick}
        >
          <When isTrue={hasValue(buttonIcon)}>
            <CommonSVG
              svg={buttonIcon}
              width={buttonIconWidth || '16'}
              height={buttonIconHeight || '16'}
            />
          </When>
          <div> {buttonText}</div>
        </button>
      </When>
    </div>
  )
}

export default CommonEmptyState
