import LinkSimpleIcon from 'assets/icons/LinkSimpleIcon'
import When from 'components/when/When'
// Removed empty import from 'react-router-dom'
import hasValue from 'utils/hasValue'
import {ITreatmentPlan} from 'screens/Patients/LeadsProfile/main/treatment/types/treatmentPlan.types'
import {SectionTitle} from '../../ProductionReview/ProductionSetupReview'
import {AllFiles} from 'screens/Patients/LeadsProfile/main/files/types/files.types'
import {bytesToMB} from '@utils/bytesToMB'
import {fileFormatDateTime} from 'utils/DateFunctions'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import {SVG_ZIP_FILE} from 'utils/SvgConstants'
import {useContext} from 'react'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import userTypes from '@constants/userTypes'
import {downloadFile} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'
import {downloadBlob} from 'utils/download'
import {safeParseInt} from 'utils/ConstFunctions'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {Spin} from 'antd'
import Spinner from 'components/spinner/Spinner'

const STLFilesView = ({
  showTitle = true,
  treatmentPlan,
  stlFileMetaData,
}: {
  showTitle?: boolean
  treatmentPlan: ITreatmentPlan
  stlFileMetaData: AllFiles[]
}) => {
  const {dispatchAction} = useDispatchAction()
  const {userId} = useContext(AuthContext)
  const hasFiles = hasValue(stlFileMetaData)
  const hasLinks = hasValue(treatmentPlan?.stl_file_metadata?.link)
  const hasAny = hasFiles || hasLinks
  const {downloadingFile} = useSelector((state: RootState) => state.leadsProfileFiles)

  const handleDownload = async (file: AllFiles) => {
    try {
      if (file.is_gdrive_platform) {
        window.open(file.download_url, '_blank')
        return
      }
      if (userId && file?.file_id) {
        const response = await dispatchAction(
          downloadFile({
            requester_user_id: parseInt(userId),
            requester_user_type: userTypes.DOCTOR,
            file_id: safeParseInt(file.file_id),
          })
        ).unwrap()
        const blob = new Blob([response], {
          type: file?.type || 'application/octet-stream',
        })
        downloadBlob(blob, file?.name || 'file.zip')
        return
      }
      if (file?.url) {
        window.open(file.url, '_blank')
      }
    } catch {
      if (file?.url) window.open(file.url, '_blank')
    }
  }

  return (
    <div>
      {showTitle && <SectionTitle title='STL Files' />}

      {hasAny ? (
        <>
          {/* STL files */}
          <When isTrue={hasFiles}>
            <Spin indicator={<Spinner loading={downloadingFile} />} spinning={downloadingFile}>
              <div className='flex items-center gap-3 justify-between border-b border-neutral-200 pb-3 mb-3'>
                <div className='flex flex-col w-full gap-3'>
                  {stlFileMetaData
                    ?.filter((f: AllFiles) => f?.extension?.toLowerCase() === 'zip')
                    .map((f: AllFiles, idx: number) => (
                      <div
                        key={f.file_id ?? idx}
                        className='flex items-center justify-between w-full border border-mediumGray rounded-lg p-3 cursor-pointer'
                        onClick={() => handleDownload(f)}
                      >
                        <div className='flex items-center gap-3'>
                          <div className='flex items-center justify-center w-12 h-12 bg-secondarySupport rounded-lg border border-mediumGray'>
                            <CommonSVG svg={SVG_ZIP_FILE} width='48' height='48' />
                          </div>
                          <div className='flex flex-col'>
                            <p className='text-base text-black mb-1 break-all'>{f.name}</p>
                            <p className='text-sm text-textColor'>
                              {bytesToMB(f.size)} MB, {fileFormatDateTime(f.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </Spin>
          </When>

          {/* Link section */}
          <When isTrue={hasLinks}>
            <div className='flex items-start gap-3'>
              <div className='flex items-center justify-center w-10 h-10 bg-primarySupport rounded-lg'>
                <LinkSimpleIcon />
              </div>
              <div className='flex flex-col'>
                <p className='text-base text-black mb-1'>Link</p>
                {treatmentPlan?.stl_file_metadata?.link?.map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-sm font-normal text-primaryColor underline mb-0.5'
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          </When>
        </>
      ) : (
        <div className='flex justify-start '>
          <div className='text-textColor text-sm'>{'No files added'}</div>
        </div>
      )}
    </div>
  )
}

export default STLFilesView
