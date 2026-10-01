import {useState} from 'react'
import HeaderSmileSimulation from './components/HeaderSmileSimulation'
import InfoSmileSimulation from './components/InfoSmileSimulation'
import FileUploaderSmileSimulation from './components/FileUploaderSmileSimulation'
import {ViewSmileSimulation} from './components/ViewSmileSimulation'
export interface IFile {
  url: string
  type: string
  name: string
  file: {
    size: number
  }
}
const SmileSimulation = () => {
  const [fileUrls, setFileUrls] = useState<IFile | null>(null)
  const [smileSimulatedResponse, setSmileSimulatedResponse] = useState<string | null>(null)

  return (
    <div className='flex flex-col gap-1'>
      <HeaderSmileSimulation />
      <div className='w-full flex justify-center gap-2 px-2'>
        <div className='w-full flex flex-col gap-4 md:w-4/5'>
          <div>
            <InfoSmileSimulation />
          </div>
          <FileUploaderSmileSimulation
            fileUrls={fileUrls}
            setFileUrls={setFileUrls}
            setSmileSimulatedResponse={setSmileSimulatedResponse}
            accept='.jpg, .jpeg, .png'
          />
          <hr />
          <ViewSmileSimulation
            uploadedFiles={fileUrls}
            smileSimulatedResponse={smileSimulatedResponse}
          />
        </div>
      </div>
    </div>
  )
}

export default SmileSimulation
