import getColorPalette from './getColorPalette'

const generateCssVariables = () => {
  const colors = getColorPalette()
  const root = document.documentElement
  root.style.setProperty('--primary-color', colors.primaryColor)
  root.style.setProperty('--primary-support', colors.primarySupport)
  root.style.setProperty('--secondary-color', colors.secondaryColor)
  root.style.setProperty('--secondary-support', colors.secondarySupport)
  root.style.setProperty('--tertiary-color', colors.tertiaryColor)
  root.style.setProperty('--tertiary-support', colors.tertiarySupport)
  root.style.setProperty('--red', colors.red)
  root.style.setProperty('--red-support', colors.redSupport)
  root.style.setProperty('--text-color', colors.textColor)
  root.style.setProperty('--gray-disabled', colors.grayDisabled)
  root.style.setProperty('--light-gray', colors.lightGray)
  root.style.setProperty('--medium-gray', colors.mediumGray)
  root.style.setProperty('--lighter-gray', colors.lighterGray)
  root.style.setProperty('--black', colors.black)
  root.style.setProperty('--white', colors.white)
  root.style.setProperty('--light-orange', colors.lightOrange)
  root.style.setProperty('--orange-support', colors.orangeSupport)
  root.style.setProperty('--orange', colors.orange)
  root.style.setProperty('--neutral-black', colors.neutralBlack)
}
export default generateCssVariables
