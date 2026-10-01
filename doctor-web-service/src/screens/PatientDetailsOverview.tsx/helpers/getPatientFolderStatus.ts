import HttpMethod from '@constants/httpMethods.constants'
import apiHelper from '@utils/apiHelper'
import {URL_GET_FOLDERS_STATUS} from 'redux/Endpoints/apiEndpoints'

const getPatientFolderStatus = async (patientId: string | number) => {
  const url = `${URL_GET_FOLDERS_STATUS}${patientId}`
  const response = await apiHelper(url, HttpMethod.GET)

  return response?.data === true
}

export default getPatientFolderStatus
