import When from 'components/when/When'
import pdfPng from 'assets/images/Pdf.png'
import {useState} from 'react'
import PDFWebview from 'screens/Patients/LeadsProfile/main/files/components/PDFWebview'
import {Image} from 'assets/images/Images/Image'
import {Modal} from 'antd'

const PhotosRow = ({
  fileUrls,
  photoType,
}: {
  fileUrls: {url: string; type: string; name: string}[]
  photoType: string
}) => {
  const [pdfViewer, setPdfViewer] = useState<{
    isOpen: boolean
    url: string
    fileName?: string
  }>({
    isOpen: false,
    url: '',
    fileName: '',
  })
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)

  const imageFiles = fileUrls.filter((file) => file.type !== 'application/pdf')

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
          <Modal
            open={previewOpen}
            onCancel={() => setPreviewOpen(false)}
            footer={null}
            zIndex={2100}
            width={760}
          >
            <div className='flex flex-col gap-4'>
              {imageFiles[previewIndex]?.url ? (
                <Image
                  src={imageFiles[previewIndex].url}
                  className='w-full max-h-[70vh] object-contain'
                  alt='Aligner preview'
                  showLoading
                  size={48}
                />
              ) : null}
              {imageFiles.length > 1 && (
                <div className='flex gap-2 flex-wrap'>
                  {imageFiles.map((file, index) => (
                    <button
                      key={`${file.url}-${index}`}
                      type='button'
                      className={`rounded-lg border ${
                        index === previewIndex ? 'border-primaryColor' : 'border-mediumGray'
                      }`}
                      onClick={() => setPreviewIndex(index)}
                    >
                      <Image
                        src={file.url}
                        className='!w-16 !h-16 object-cover rounded-lg'
                        alt='Aligner thumbnail'
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Modal>
          <p className='text-sm font-medium text-textColor'>{photoType}</p>
          <div className='flex flex-wrap gap-3'>
            {fileUrls.map((file, index) => {
              const imageIndex = imageFiles.indexOf(file)
              return (
                <div key={index}>
                  <When isTrue={file.type !== 'application/pdf'}>
                    <Image
                      src={file.url}
                      alt='Uploaded file '
                      className='w-14 h-14 rounded-[4px] border border-lightGray object-cover cursor-pointer'
                      onClick={() => {
                        if (imageIndex >= 0) {
                          setPreviewIndex(imageIndex)
                          setPreviewOpen(true)
                        }
                      }}
                    />
                  </When>
                  <When isTrue={file.type === 'application/pdf'}>
                    <Image
                      className='w-14 h-14 rounded-[4px] object-cover cursor-pointer'
                      src={pdfPng}
                      alt='PDF file'
                      onClick={() => handleOpenPDF(file.url ?? '')}
                    />
                  </When>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}

export default PhotosRow
