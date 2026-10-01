const getColorPalette = () => {
  const brand = process.env.REACT_APP_BRAND_NAME || 'DENTALSTACK'
  const defaultColors = {
    primaryColor: '#735BF2',
    primarySupport: '#F5F4FE',
    secondaryColor: '#0095FF',
    secondarySupport: '#E9F3FA',
    tertiaryColor: '#00B383',
    tertiarySupport: '#EBF8F4',
    red: '#F45045',
    redSupport: '#FEF4F4',
    textColor: '#666666',
    grayDisabled: '#b0b0b0',
    lightGray: '#EFEFEF',
    mediumGray: '#D9D9D9',
    lighterGray: '#e6e6e6',
    black: '#000000',
    white: '#ffffff',
    lightOrange: '#FFEDBF',
    orangeSupport: '#FFEBB8',
    orangeSupport2: '#FDF1DE',
    orange: '#BE8901',
    neutralBlack: '#1D1F2C',
  }
  switch (brand) {
    case 'SMILEZY':
      return {
        ...defaultColors,
        primaryColor: '#5731F7',
        secondaryColor: '#FF7373',
        primarySupport: '#EFEBFF',
        secondarySupport: '#FFF1F1',
        neutralBlack: '#16162D',
      }
    case 'ROUTETOSMILE':
      return {
        ...defaultColors,
        primaryColor: '#3A60CF',
        secondaryColor: '#2D2C76',
        primarySupport: '#F0F3FB',
        secondarySupport: '#EFEFF4',
        neutralBlack: '#131314',
      }
    case 'CRAFTALIGN':
      return {
        ...defaultColors,
        primaryColor: '#228DEA',
        secondaryColor: '#292785',
        primarySupport: '#EEF6FE',
        secondarySupport: '#EEEEF6',
        neutralBlack: '#010101',
      }
    case 'SYNAPSE':
      return {
        ...defaultColors,
        primaryColor: '#068370',
        secondaryColor: '#068370',
        primarySupport: '#80DAC6',
        secondarySupport: '#80DAC6',
        neutralBlack: '#131314',
      }
    case 'CLEARCASTLE':
      return {
        ...defaultColors,
        primaryColor: '#017D8A',
        secondaryColor: '#F38D86',
        primarySupport: '#EBF5F6',
        secondarySupport: '#FEF6F6',
        neutralBlack: '#1A1b1C',
      }
    case 'SMILEXCEL':
      return {
        ...defaultColors,
        primaryColor: '#007CC2',
        secondaryColor: '#FEC32B',
        primarySupport: '#E6F3FB',
        secondarySupport: '#FFF8E6',
      }
    case 'AIIQALIGNER':
      return {
        ...defaultColors,
        primaryColor: '#D9A520',
        secondaryColor: '#9b8466',
        primarySupport: '#FCF8ED',
        secondarySupport: '#f7f5f3',
        neutralBlack: '#131314',
      }
    case 'CONFIDENTALIGNER':
      return {
        ...defaultColors,
        primaryColor: '#CF2E2E',
        secondaryColor: '#6D6D6D',
        primarySupport: '#FBEEEE',
        secondarySupport: '#F3F3F3',
        neutralBlack: '#131314',
      }
    default: // DENTALSTACK
      return defaultColors
  }
}

// Helper: generate CSS variable declarations for the current brand
export const getCssVariables = () => {
  const palette = getColorPalette()
  return Object.entries(palette).reduce(
    (acc, [key, value]) => {
      acc[`--${camelToKebab(key)}`] = String(value)
      return acc
    },
    {} as Record<string, string>
  )
}

const camelToKebab = (s: string) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()

export default getColorPalette
