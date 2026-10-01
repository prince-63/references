import BorderedCard from 'components/BorderedCard/BorderedCard'
import Tag from 'components/tags/Tag'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import LabelWithTag from './components/LabelWithTag'
import hasValue from 'utils/hasValue'
import When from 'components/when/When'
import {useNavigate, useParams} from 'react-router-dom'
import pdfPng from 'assets/images/Pdf.png'
import {
  CaseInfo,
  getCaseInformation,
  Relations,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import apiHelper from '@utils/apiHelper'
import {URL_ADD_CASE_INFORMATION} from 'redux/Endpoints/apiEndpoints'
import HttpMethod from '@constants/httpMethods.constants'
import {useSearchParams} from 'react-router-dom'
import ViewInformationSection from 'components/section/ViewInformationSection'
import Page from 'components/page/Page'
import {getImageUrl, identifyUser, safeParseInt} from 'utils/ConstFunctions'
import {ReactNode, useContext, useEffect, useState} from 'react'
import {Image} from 'assets/images/Images/Image'
import ImageViewer from 'screens/Patients/PatientProfile/Tabs/ImageViewer'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {IFile} from '../treatment/types/treatmentPlan.types'
import {caseInfoEmptyData} from './AddCaseInformation'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import PDFWebview from '../files/components/PDFWebview'

const ViewCaseInformation = () => {
  const {caseInformation: allCaseInfoData, reviewCaseInfoData} = useSelector(
    (state: RootState) => state.leadsProfile
  )
  const [savingCaseInformation, setSavingCaseInformation] = useState(false)
  const {patientId} = useParams()
  const {dispatchAction} = useDispatchAction()
  const {userId} = useContext(AuthContext)
  const [isShowPhotos, setIsShowPhotos] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [searchParams] = useSearchParams()
  const [caseInformation, setCaseInformation] = useState<CaseInfo>(caseInfoEmptyData)
  const isNew = searchParams.get('new')
  const navigate = useNavigate()

  const [pdfViewer, setPdfViewer] = useState<{
    isOpen: boolean
    url: string
    fileName?: string
  }>({
    isOpen: false,
    url: '',
    fileName: '',
  })

  // PDF handler functions - Add these
  const handleOpenPDF = (url: string, fileName?: string) => {
    setPdfViewer({
      isOpen: true,
      url,
      fileName,
    })
  }

  const handleClosePDF = () => {
    setPdfViewer({
      isOpen: false,
      url: '',
      fileName: '',
    })
  }

  useEffect(() => {
    if (isNew === 'false') {
      setCaseInformation(
        allCaseInfoData.metadata !== null
          ? {...allCaseInfoData.metadata, files: allCaseInfoData.files}
          : caseInfoEmptyData
      )
    } else {
      setCaseInformation(reviewCaseInfoData)
    }
  }, [allCaseInfoData])

  const saveCaseInformation = async () => {
    if (isNew === 'false') {
      identifyUser()
      const queryParams = new URLSearchParams({
        isEdit: 'true',
      }).toString()

      return navigate(`/profile/${patientId}/details/case-files?${queryParams}`)
    } else {
      identifyUser()
      setSavingCaseInformation(true)

      const formData = new FormData()
      formData.append(
        'details',
        JSON.stringify({
          patient_id: patientId,
          doctor_id: userId,
          product_type: 'ALIGNERS',
          metadata: {
            cheif_complaint: caseInformation?.cheif_complaint,
            missing_teeth: caseInformation?.missing_teeth
              ? caseInformation?.missing_teeth?.map(Number)
              : [],
            allergy: caseInformation?.allergy,
            medical_condition: caseInformation?.medical_condition || [],
            dental_history: caseInformation.dental_history,
            relations: caseInformation.relations,
            overjet: caseInformation.overjet ? parseFloat(caseInformation.overjet) : null,
            deep_bite: caseInformation.deep_bite ? parseFloat(caseInformation.deep_bite) : null,
            deep_bite_in_percentage: caseInformation.deep_bite_in_percentage
              ? parseInt(caseInformation.deep_bite_in_percentage, 10)
              : null,
            open_bite: caseInformation.open_bite ? parseFloat(caseInformation.open_bite) : null,
            midline: caseInformation.midline,
            remarks: caseInformation.remarks,
            diagnosis: caseInformation.diagnosis,
            extra_oral_remarks: caseInformation.extra_oral_remarks,
            cephalometric_analysis: caseInformation.cephalometric_analysis,
            treatment_objective: caseInformation.treatment_objective,
          },
        })
      )
      reviewCaseInfoData?.filesToSave?.forEach((file) => {
        formData.append('photo', file)
      })

      await apiHelper(`${URL_ADD_CASE_INFORMATION}`, HttpMethod.POST, formData)
        .then(() => {
          setSavingCaseInformation(false)
          if (!patientId || !userId) return console.error('Patient ID or User Id not found')
          dispatchAction(
            getCaseInformation({
              patient_id: patientId,
              doctor_id: userId,
              product_type: 'ALIGNER',
            })
          )
          const postData = {
            patient_id: safeParseInt(patientId),
            doctor_id: safeParseInt(userId),
          }
          dispatchAction(getLeadsProfileDetails(postData) as any)
          navigate(`?new=false`)
        })
        .catch(() => {
          setSavingCaseInformation(false)
        })
    }
  }

  type RelationKeys = keyof Relations // 'molar' | 'canine' | 'incisor' | 'skeletal'
  {
    Object.keys(caseInformation?.relations || {}).map((key) => {
      // Ensure key is a valid RelationKeys type
      if (Object.keys(caseInformation.relations).includes(key)) {
        const value = caseInformation?.relations?.[key as RelationKeys]

        return (
          <LabelWithTag
            key={key}
            className='text-base bg-secondarySupport text-secondaryColor w-8 h-8'
            label={`${key.charAt(0).toUpperCase()}${key.slice(1)} relation`}
            value={hasValue(value) ? '|'.repeat(Number(value)) : '-'}
          />
        )
      }
      return null
    })
  }
  const queryParams = new URLSearchParams({
    isEdit: 'true',
  }).toString()

  return (
    <>
      {pdfViewer.isOpen && (
        <PDFWebview pdfUrl={pdfViewer.url} onBack={handleClosePDF} fileName={pdfViewer.fileName} />
      )}
      {!pdfViewer.isOpen && (
        <Page
          title='Review case information details'
          showBackButton={isNew === 'true'}
          backNavigationRoute={`/profile/${patientId}/details/case-files?${queryParams}`}
        >
          <When isTrue={hasValue(caseInformation)}>
            <When isTrue={isShowPhotos && hasValue(caseInformation?.files)}>
              <ImageViewer
                setIsShowPhotos={setIsShowPhotos}
                selectedImagesList={caseInformation?.files?.map((file: IFile, index) => ({
                  id: index,
                  src: file?.url,
                  width: '100%',
                  height: '100%',
                }))}
                selectedIndex={selectedIndex}
              />
            </When>
            <div className='flex flex-col gap-3'>
              <BorderedCard>
                <ViewInformationSection title='Chief complaint' showBorder={false}>
                  <div className='text-[16px] font-normal text-textColor  break-words'>
                    {hasValue(caseInformation?.cheif_complaint)
                      ? caseInformation?.cheif_complaint
                      : '-'}
                  </div>
                </ViewInformationSection>
              </BorderedCard>

              <BorderedCard>
                <ViewInformationSection title='Medical history' showBorder={false}>
                  {caseInformation?.allergy !== null && (
                    <DataShow
                      title='Allergies'
                      subTitle={
                        caseInformation && caseInformation?.allergy?.length > 0
                          ? caseInformation.allergy.join(', ')
                          : '-'
                      }
                    />
                  )}
                  {caseInformation?.medical_condition !== null && (
                    <DataShow
                      title='Medical conditions'
                      subTitle={
                        caseInformation && caseInformation?.medical_condition?.length > 0
                          ? caseInformation?.medical_condition.join(', ')
                          : '-'
                      }
                    />
                  )}
                </ViewInformationSection>
              </BorderedCard>

              <BorderedCard>
                <ViewInformationSection title='Dental history' showBorder={false}>
                  <div className='text-lg font-semibold my-1'>Intra-oral examination</div>
                  {caseInformation?.dental_history !== null && (
                    <DataShow
                      title='Dental history'
                      subTitle={
                        caseInformation && caseInformation?.dental_history?.length > 0
                          ? caseInformation?.dental_history?.join(', ')
                          : '-'
                      }
                    />
                  )}

                  <DataShow
                    title='Missing tooth'
                    subTitle={
                      <div className='flex gap-1'>
                        <When isTrue={caseInformation?.missing_teeth !== null}>
                          {caseInformation &&
                            caseInformation?.missing_teeth?.map((tooth: number) => (
                              <Tag
                                value={tooth}
                                key={tooth}
                                className='text-base bg-secondarySupport text-secondaryColor w-12'
                              />
                            ))}
                        </When>
                        <When isTrue={!hasValue(caseInformation?.missing_teeth)}>-</When>
                      </div>
                    }
                  />

                  <div className='text-lg font-semibold my-1'>
                    Examination of teeth in occlusionn
                  </div>
                  <div className='grid md:grid-cols-2 grid-flow-row w-full gap-3'>
                    {Object.keys((caseInformation && caseInformation?.relations) || {}).map(
                      (key) => {
                        if (Object.keys(caseInformation?.relations).includes(key)) {
                          const value = caseInformation?.relations[key as RelationKeys]
                          return (
                            <LabelWithTag
                              key={key}
                              className='text-base bg-secondarySupport text-secondaryColor w-8 h-8'
                              label={`${key.charAt(0).toUpperCase()}${key.slice(1)} relation`}
                              value={hasValue(value) ? '|'.repeat(Number(value)) : '-'}
                            />
                          )
                        }
                        return null
                      }
                    )}
                  </div>

                  <div className='flex flex-col gap-4 justify-start'>
                    <div className='flex flex-col md:flex-row w-full md:justify-between md:gap-8 gap-4'>
                      <div className='flex flex-col md:w-1/2 gap-4'>
                        <LabelWithTag
                          label={'Overjet'}
                          value={
                            (caseInformation && caseInformation?.overjet === null) ||
                            safeParseInt(caseInformation?.overjet) === 0
                              ? '-'
                              : `${caseInformation?.overjet + ' mm'}`
                          }
                          showTag={false}
                        />

                        <LabelWithTag
                          label={'Deep bite (%)'}
                          value={
                            (caseInformation &&
                              caseInformation?.deep_bite_in_percentage === null) ||
                            safeParseInt(caseInformation?.deep_bite_in_percentage) === 0
                              ? '-'
                              : `${caseInformation?.deep_bite_in_percentage + '%'}`
                          }
                          showTag={false}
                        />
                      </div>

                      <div className='flex flex-col md:w-1/2 gap-4'>
                        <LabelWithTag
                          label={'Deep bite'}
                          value={
                            (caseInformation && caseInformation?.deep_bite === null) ||
                            safeParseInt(caseInformation?.deep_bite) === 0
                              ? '-'
                              : `${caseInformation?.deep_bite + ' mm'}`
                          }
                          showTag={false}
                        />
                        <LabelWithTag
                          label={'Open bite'}
                          value={
                            (caseInformation && caseInformation?.open_bite === null) ||
                            safeParseInt(caseInformation?.open_bite) === 0
                              ? '-'
                              : `${caseInformation?.open_bite + ' mm'}`
                          }
                          showTag={false}
                        />
                      </div>
                    </div>
                    <div className='md:w-[50%]'>
                      <LabelWithTag
                        label={'Midline'}
                        value={
                          hasValue(caseInformation?.midline)
                            ? caseInformation && caseInformation?.midline
                            : '-'
                        }
                        showTag={true}
                      />
                    </div>
                  </div>
                  <div className='text-[16px] font-semibold '>Remarks</div>
                  <div className='text-[16px] font-normal text-textColor break-words'>
                    {caseInformation?.remarks ? caseInformation?.remarks : 'Not added'}
                  </div>

                  <hr />

                  <div className='text-[16px] font-semibold '>Extra-oral examination</div>
                  <div className='text-[16px] font-normal text-textColor  break-words'>
                    {caseInformation?.extra_oral_remarks === '' ||
                    caseInformation?.cephalometric_analysis === null
                      ? 'Not added'
                      : caseInformation?.extra_oral_remarks}
                  </div>

                  <div className='text-[16px] font-semibold '>Cephalometric analysis</div>
                  <div className='text-[16px] font-normal text-textColor  break-words'>
                    {caseInformation?.cephalometric_analysis === '' ||
                    caseInformation?.cephalometric_analysis === null
                      ? 'Not added'
                      : caseInformation?.cephalometric_analysis}
                  </div>
                </ViewInformationSection>
                <When isTrue={hasValue(caseInformation?.files)}>
                  <div className='flex flex-col md:flex-row w-full gap-2 mt-3'>
                    {caseInformation?.files &&
                      caseInformation?.files?.map((file: IFile, index) => (
                        <div
                          key={index}
                          className='flex items-center gap-2 flex-shrink justify-between'
                        >
                          <div
                            className='flex items-center justify-between gap-4 cursor-pointer'
                            onClick={() => {
                              if (file.extension === 'mp4' || file.extension === 'pdf') {
                                handleOpenPDF(file.url ?? '')
                              } else {
                                setIsShowPhotos(true)
                                setSelectedIndex(index)
                              }
                            }}
                          >
                            <When isTrue={file.extension !== 'mp4' && file.extension !== 'pdf'}>
                              <Image
                                src={getImageUrl(file)}
                                alt='Uploaded file '
                                className='w-12 h-12 rounded-[4px] border border-lightGray object-cover cursor-pointer'
                                size={20}
                                showFileName={true}
                                showLoading={true}
                              />
                            </When>

                            <When isTrue={file.extension === 'pdf'}>
                              <Image
                                className='w-12 h-12 rounded-[4px]  object-cover cursor-pointer'
                                size={20}
                                src={pdfPng}
                              />
                            </When>
                          </div>
                        </div>
                      ))}
                  </div>
                </When>
              </BorderedCard>

              <BorderedCard>
                <ViewInformationSection title='Diagnosis' showBorder={false}>
                  <div className='text-[16px] font-normal text-textColor  break-words'>
                    {caseInformation?.diagnosis === '' || caseInformation?.diagnosis === null
                      ? 'Not added'
                      : caseInformation?.diagnosis}
                  </div>
                </ViewInformationSection>
              </BorderedCard>

              <BorderedCard>
                <ViewInformationSection title='Treatment objective' showBorder={false}>
                  <div className='text-[16px] font-normal text-textColor  break-words'>
                    {caseInformation?.treatment_objective === '' ||
                    caseInformation?.treatment_objective === null
                      ? 'Not added'
                      : caseInformation?.treatment_objective}
                  </div>
                </ViewInformationSection>
              </BorderedCard>
            </div>

            <div className='font-semibold text-base flex flex-col-reverse md:flex-row gap-3 mt-3 justify-end'>
              <When isTrue={isNew === 'true'}>
                <button
                  className='md:text-grayDisabled md:border-none rounded-lg p-3 border border-mediumGray text-black'
                  onClick={() => {
                    navigate(-1)
                  }}
                >
                  Cancel
                </button>
              </When>
              <AntdButton
                onClick={saveCaseInformation}
                className='bg-primaryColor text-white h-12 font-semibold text-base'
                isLoading={savingCaseInformation}
                text={`${isNew === 'true' ? 'Save case information' : 'Edit case information'}`}
              />
            </div>
          </When>
        </Page>
      )}
    </>
  )
}

export default ViewCaseInformation

const DataShow = ({title, subTitle}: {title: string; subTitle: ReactNode}) => {
  return (
    <div className='flex md:justify-between justify-start md:items-center items-start md:flex-row flex-col'>
      <div className='text-[16px] font-medium text-textColor text-start'>{title}</div>
      <div className='text-[16px] font-medium '>{subTitle}</div>
    </div>
  )
}
