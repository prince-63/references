import Tag from 'components/tags/Tag'
import When from 'components/when/When'
import {useState} from 'react'
import {CaseInfo, Relations} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import hasValue from 'utils/hasValue'
import {IFile} from 'screens/Patients/LeadsProfile/main/treatment/types/treatmentPlan.types'
import LabelWithTag from 'screens/Patients/LeadsProfile/main/caseInformation/components/LabelWithTag'
import {getImageUrl, safeParseInt} from 'utils/ConstFunctions'
import {Image} from 'assets/images/Images/Image'
import ImageViewer from 'screens/Patients/PatientProfile/Tabs/ImageViewer'
import {DataWrapper} from './DataWrapper'
import {ConditionalValueDiv} from './ConditionalValueDiv'
import PDFWebview from 'screens/Patients/LeadsProfile/main/files/components/PDFWebview'

const CaseInfoSummary = ({caseInformation, files}: {caseInformation: CaseInfo; files: IFile[]}) => {
  const medical_history = {
    allergy: caseInformation?.allergy,
    medical_condition: caseInformation?.medical_condition,
  }
  const intra_oral_examination = {
    dental_history: caseInformation?.dental_history,
    missing_teeth: caseInformation?.missing_teeth,
  }
  const examination_of_teeth_in_occlusion = {
    relations: caseInformation?.relations,
    overjet: caseInformation?.overjet,
    deep_bite: caseInformation?.deep_bite,
    deep_bite_in_percentage: caseInformation?.deep_bite_in_percentage,
    open_bite: caseInformation?.open_bite,
    midline: caseInformation?.midline,
  }

  const extra_oral_examination = {
    cephalometric_analysis: caseInformation?.cephalometric_analysis,
    extra_oral_remarks: caseInformation?.extra_oral_remarks,
    files: files,
  }

  type RelationKeys = keyof Relations // 'molar' | 'canine' | 'incisor' | 'skeletal'
  {
    Object.keys(examination_of_teeth_in_occlusion?.relations || {}).map((key) => {
      // Ensure key is a valid RelationKeys type
      if (Object.keys(examination_of_teeth_in_occlusion.relations).includes(key)) {
        const value = examination_of_teeth_in_occlusion?.relations?.[key as RelationKeys]

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

  const [isShowPhotos, setIsShowPhotos] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [pdfViewer, setPdfViewer] = useState<{
    isOpen: boolean
    url: string
    fileName?: string
  }>({
    isOpen: false,
    url: '',
    fileName: '',
  })

  // Function to open PDF viewer
  const handleOpenPDF = (url: string, fileName?: string) => {
    setPdfViewer({
      isOpen: true,
      url,
      fileName,
    })
  }

  // Function to close PDF viewer
  const handleClosePDF = () => {
    setPdfViewer({
      isOpen: false,
      url: '',
      fileName: '',
    })
  }
  return (
    <>
      {pdfViewer.isOpen && (
        <PDFWebview pdfUrl={pdfViewer.url} onBack={handleClosePDF} fileName={pdfViewer.fileName} />
      )}

      {!pdfViewer.isOpen && (
        <div>
          <When isTrue={isShowPhotos && hasValue(extra_oral_examination?.files)}>
            <ImageViewer
              setIsShowPhotos={setIsShowPhotos}
              selectedImagesList={extra_oral_examination?.files?.map(
                (file: IFile, index: number) => ({
                  id: index,
                  src: getImageUrl(file),
                  width: '100%',
                  height: '100%',
                })
              )}
              selectedIndex={selectedIndex}
            />
          </When>
          <DataWrapper
            showBorder={
              hasValue(medical_history.allergy) || hasValue(medical_history.medical_condition)
            }
            title='Chief complaint'
            className='font-semibold text-[16px]'
            isShow={hasValue(caseInformation?.cheif_complaint)}
          >
            <div className='text-[14px] font-normal text-textColor  break-words'>
              {caseInformation?.cheif_complaint}
            </div>
          </DataWrapper>

          <DataWrapper
            showBorder={
              hasValue(intra_oral_examination.dental_history) ||
              hasValue(intra_oral_examination.missing_teeth) ||
              hasValue(examination_of_teeth_in_occlusion?.relations?.canine) ||
              hasValue(examination_of_teeth_in_occlusion?.relations?.molar) ||
              hasValue(examination_of_teeth_in_occlusion?.relations?.incisor) ||
              hasValue(examination_of_teeth_in_occlusion?.relations?.skeletal) ||
              hasValue(examination_of_teeth_in_occlusion?.overjet) ||
              hasValue(examination_of_teeth_in_occlusion?.deep_bite) ||
              hasValue(examination_of_teeth_in_occlusion?.deep_bite_in_percentage) ||
              hasValue(examination_of_teeth_in_occlusion?.open_bite) ||
              hasValue(examination_of_teeth_in_occlusion?.midline)
            }
            title='Medical history'
            className='text-[16px] font-semibold'
            isShow={
              hasValue(medical_history.allergy) || hasValue(medical_history.medical_condition)
            }
          >
            <ConditionalValueDiv
              label='Allergies'
              value={
                caseInformation?.allergy && caseInformation?.allergy?.length > 0
                  ? caseInformation?.allergy.join(', ')
                  : null
              }
            />
            <ConditionalValueDiv
              label='Medical conditions'
              value={
                caseInformation?.medical_condition && caseInformation?.medical_condition?.length > 0
                  ? caseInformation?.medical_condition.join(', ')
                  : null
              }
            />
          </DataWrapper>

          <When
            isTrue={
              hasValue(intra_oral_examination?.dental_history) ||
              hasValue(intra_oral_examination?.missing_teeth)
            }
          >
            <div className='text-[16px] font-semibold mb-2'>Dental history</div>

            <DataWrapper
              isShow={
                hasValue(intra_oral_examination?.dental_history) ||
                hasValue(intra_oral_examination?.missing_teeth)
              }
              title='Intra-oral examination'
            >
              <div>
                <ConditionalValueDiv
                  label='Dental history'
                  value={
                    intra_oral_examination.dental_history &&
                    intra_oral_examination.dental_history?.length > 0
                      ? intra_oral_examination.dental_history?.join(', ')
                      : null
                  }
                />
                <ConditionalValueDiv
                  label='Missing tooth'
                  value={
                    <div className='flex flex-wrap gap-1'>
                      {intra_oral_examination?.missing_teeth !== null
                        ? intra_oral_examination?.missing_teeth?.map((tooth: number) => (
                            <Tag
                              value={tooth}
                              key={tooth}
                              className='text-base bg-secondarySupport text-secondaryColor w-12 my-2'
                            />
                          ))
                        : null}
                    </div>
                  }
                />
              </div>
            </DataWrapper>
          </When>
          <DataWrapper
            isShow={
              hasValue(examination_of_teeth_in_occlusion?.relations?.canine) ||
              hasValue(examination_of_teeth_in_occlusion?.relations?.molar) ||
              hasValue(examination_of_teeth_in_occlusion?.relations?.incisor) ||
              hasValue(examination_of_teeth_in_occlusion?.relations?.skeletal) ||
              hasValue(examination_of_teeth_in_occlusion?.overjet) ||
              hasValue(examination_of_teeth_in_occlusion?.deep_bite) ||
              hasValue(examination_of_teeth_in_occlusion?.deep_bite_in_percentage) ||
              hasValue(examination_of_teeth_in_occlusion?.open_bite) ||
              hasValue(examination_of_teeth_in_occlusion?.midline)
            }
            title='Examination of teeth in occlusion'
            showBorder={
              hasValue(extra_oral_examination?.cephalometric_analysis) ||
              hasValue(extra_oral_examination?.files)
            }
          >
            <div>
              {Object.keys(examination_of_teeth_in_occlusion?.relations || {}).map((key) => {
                if (Object.keys(examination_of_teeth_in_occlusion.relations).includes(key)) {
                  const value = examination_of_teeth_in_occlusion.relations[key as RelationKeys]
                  return (
                    <ConditionalValueDiv
                      key={key}
                      label={`${key.charAt(0).toUpperCase()}${key.slice(1)} relation`}
                      value={hasValue(value) ? '|'.repeat(Number(value)) : null}
                      showTag={true}
                    />
                  )
                }
                return null
              })}
            </div>
            <ConditionalValueDiv
              label={'Overjet'}
              value={
                caseInformation?.overjet === null || safeParseInt(caseInformation?.overjet) === 0
                  ? null
                  : `${caseInformation?.overjet + ' mm'}`
              }
              showTag={false}
            />
            <ConditionalValueDiv
              label={'Deep bite'}
              value={
                caseInformation?.deep_bite === null ||
                safeParseInt(caseInformation?.deep_bite) === 0
                  ? null
                  : `${caseInformation?.deep_bite + ' mm'}`
              }
              showTag={false}
            />

            <ConditionalValueDiv
              label={'Deep bite (%)'}
              value={
                caseInformation?.deep_bite_in_percentage === null ||
                safeParseInt(caseInformation?.deep_bite_in_percentage) === 0
                  ? null
                  : `${caseInformation?.deep_bite_in_percentage + '%'}`
              }
              showTag={false}
            />
            <ConditionalValueDiv
              label={'Open bite'}
              value={
                caseInformation?.open_bite === null ||
                safeParseInt(caseInformation?.open_bite) === 0
                  ? null
                  : `${caseInformation?.open_bite + ' mm'}`
              }
              showTag={false}
            />
            <ConditionalValueDiv
              label={'Midline'}
              value={hasValue(caseInformation?.midline) ? caseInformation?.midline : null}
            />
          </DataWrapper>

          <DataWrapper
            isShow={
              hasValue(extra_oral_examination.extra_oral_remarks) ||
              hasValue(extra_oral_examination.cephalometric_analysis)
            }
            title='Extra-oral examination'
            showBorder={
              hasValue(examination_of_teeth_in_occlusion?.relations?.canine) ||
              hasValue(examination_of_teeth_in_occlusion?.relations?.molar) ||
              hasValue(examination_of_teeth_in_occlusion?.relations?.incisor) ||
              hasValue(examination_of_teeth_in_occlusion?.relations?.skeletal) ||
              hasValue(examination_of_teeth_in_occlusion?.overjet) ||
              hasValue(examination_of_teeth_in_occlusion?.deep_bite) ||
              hasValue(examination_of_teeth_in_occlusion?.deep_bite_in_percentage) ||
              hasValue(examination_of_teeth_in_occlusion?.open_bite) ||
              hasValue(examination_of_teeth_in_occlusion?.midline)
            }
            className='font-semibold text-[16px]'
          >
            <div className='w-full text-[14px] text-textColor font-medium'>
              {extra_oral_examination.extra_oral_remarks}
            </div>
            <ConditionalValueDiv
              label='Cephalometric analysis'
              value={extra_oral_examination.cephalometric_analysis}
            />
            <When isTrue={hasValue(extra_oral_examination?.files)}>
              <div className='flex flex-wrap w-full gap-2 mt-3'>
                {extra_oral_examination?.files &&
                  extra_oral_examination?.files?.map((file: IFile, index) => (
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
                            className='w-20 h-20 rounded-[4px] border border-lightGray object-cover cursor-pointer'
                            size={20}
                            showFileName={true}
                            showLoading={true}
                          />
                        </When>
                      </div>
                    </div>
                  ))}
              </div>
            </When>
          </DataWrapper>

          <DataWrapper
            isShow={hasValue(caseInformation?.diagnosis)}
            title='Diagnosis'
            showBorder={hasValue(caseInformation?.treatment_objective)}
            className='font-semibold text-[16px]'
          >
            <div className='text-[14px] text-textColor font-medium '>
              {caseInformation?.diagnosis}
            </div>
          </DataWrapper>

          <DataWrapper
            isShow={hasValue(caseInformation?.treatment_objective)}
            title='Treatment objective'
            showBorder={false}
            className='font-semibold text-[16px]'
          >
            <div className='text-[14px] text-textColor font-medium '>
              {caseInformation?.treatment_objective}
            </div>
          </DataWrapper>
        </div>
      )}
    </>
  )
}

export default CaseInfoSummary
