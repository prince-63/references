import {Image} from 'assets/images/Images/Image'
import When from 'components/when/When'
import React, {useState} from 'react'
import PDFWebview from 'screens/Patients/LeadsProfile/main/files/components/PDFWebview'
import {IFile} from 'screens/Patients/LeadsProfile/main/treatment/types/treatmentPlan.types'
import ImageViewer from 'screens/Patients/PatientProfile/Tabs/ImageViewer'
import {getImageUrl} from 'utils/ConstFunctions'
import hasValue from 'utils/hasValue'

const PreTreatmentPhotos = ({files}: {files: IFile[] | null}) => {
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
          <When isTrue={isShowPhotos && hasValue(files)}>
            <ImageViewer
              setIsShowPhotos={setIsShowPhotos}
              selectedImagesList={files?.map((file: IFile, index: number) => ({
                id: index,
                src: getImageUrl(file),
                width: '100%',
                height: '100%',
              }))}
              selectedIndex={selectedIndex}
            />
          </When>
          <div className='text-[16px] font-semibold mb-2'>Pre-treatment photos</div>
          <div className='flex flex-wrap w-full gap-2 mt-3'>
            {files &&
              files?.map((file: IFile, index) => (
                <div key={index} className='flex items-center gap-2 flex-shrink justify-between'>
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
        </div>
      )}
    </>
  )
}

export default PreTreatmentPhotos
