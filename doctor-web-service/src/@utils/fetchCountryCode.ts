import countryCode from '@constants/countryCode'
import axios from 'axios'

const IP_INFO_URL = process.env.REACT_APP_IPINFO_URL
const IP_INFO_TOKEN = process.env.REACT_APP_IPINFO_TOKEN

export const fetchCountryCode = async (): Promise<string | undefined | null> => {
  try {
    const response = await axios.get(`${IP_INFO_URL}?token=${IP_INFO_TOKEN}`)
    const iso2 = response?.data?.country

    const match = countryCode.find((country) => country.iso2 === iso2)
    return match?.phone_code ?? null
  } catch (error) {
    console.error('Error fetching country code from ipinfo.io:', error)
    return null
  }
}
