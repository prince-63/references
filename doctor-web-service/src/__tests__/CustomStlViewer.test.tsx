import React from 'react'
import {render, fireEvent, screen, waitFor} from '@testing-library/react'

let mockStlPreviewUrl: string | null = 'file.stl'
const mockDispatchAction = jest.fn()

jest.mock('@hooks/useDispatchAction', () => () => ({dispatchAction: mockDispatchAction}))
jest.mock('redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice', () => ({
  setIsStlFilePreviewVisible: (payload: boolean) => ({type: 'setVisible', payload}),
  setStlPreviewUrl: (payload: string) => ({type: 'setUrl', payload}),
}))
jest.mock('components/modal/ModalLayout', () => ({
  __esModule: true,
  default: ({children}: any) => <div data-testid='modal'>{children}</div>,
}))
jest.mock('components/spinner/Spinner', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid='spinner'>{String(props.loading)}</div>,
}))
jest.mock('components/three/ExoViewer', () => ({
  __esModule: true,
  default: (props: any) => (
    <div
      data-testid='exo-viewer'
      data-url={props.initialMeshes?.[0]?.url}
      onClick={props.onClose}
    />
  ),
}))
jest.mock('yet-another-react-lightbox', () => ({
  __esModule: true,
  CloseIcon: () => <span data-testid='close-icon' />,
}))
jest.mock('react-redux', () => ({
  useSelector: (fn: any) => fn({leadsProfileFiles: {stlPreviewUrl: mockStlPreviewUrl}}),
}))

const loadViewer = () => {
  delete require.cache[require.resolve('../CustomStlViewer')]
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Viewer = require('../CustomStlViewer').default
  return render(<Viewer />)
}

describe('CustomStlViewer', () => {
  beforeEach(() => {
    mockDispatchAction.mockClear()
    mockStlPreviewUrl = 'file.stl'
  })

  it('shows modal with spinner and renders STL viewer when url present', async () => {
    loadViewer()

    expect(screen.getByTestId('modal')).toBeInTheDocument()
    expect(screen.getByTestId('exo-viewer')).toHaveAttribute('data-url', 'file.stl')
    await waitFor(() => expect(screen.queryByTestId('spinner')).toBeNull())
  })

  it('closes viewer and dispatches actions on close button', async () => {
    loadViewer()
    const closeBtn = screen.getByRole('button')
    fireEvent.click(closeBtn)

    expect(mockDispatchAction).toHaveBeenCalledWith({type: 'setUrl', payload: ''})
    expect(mockDispatchAction).toHaveBeenCalledWith({type: 'setVisible', payload: false})
  })

  it('returns null when another instance owns the singleton', async () => {
    loadViewer()
    mockStlPreviewUrl = null
    loadViewer()
    expect(screen.getAllByTestId('modal')).toHaveLength(1)
  })
})
