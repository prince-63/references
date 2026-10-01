import React, {useMemo} from 'react'
import {createPortal} from 'react-dom'
import {useNavigate} from 'react-router-dom'
import {Check} from 'lucide-react'
import AntdButton from 'components/atom/Buttons/AntdButton'

type CaseSubmittedSuccessModalProps = {
  open: boolean
  orderId?: string | number | null
  patientName?: string | null
  onViewDashboard: () => void
  onCreateAnother?: () => void
}

const CONFETTI_COLORS = ['#FFD166', '#06D6A0', '#EF476F', '#118AB2', '#F4A261', '#E9C46A']

const CaseSubmittedSuccessModal = ({
  open,
  patientName,
  onViewDashboard,
  onCreateAnother,
}: CaseSubmittedSuccessModalProps) => {
  const navigate = useNavigate()
  const confettiPieces = useMemo(
    () =>
      Array.from({length: 40}, (_, index) => ({
        id: index,
        left: Math.random() * 100,
        size: 6 + Math.random() * 6,
        delay: Math.random() * 1.5,
        duration: 2.6 + Math.random() * 1.6,
        rotate: Math.random() * 360,
        color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
      })),
    []
  )

  if (!open) return null
  const portalTarget = typeof document !== 'undefined' ? document.body : null
  if (!portalTarget) return null

  return createPortal(
    <div className='fixed inset-0 z-[3000] flex items-center justify-center px-4 py-8'>
      <div
        className='absolute inset-0'
        style={{backgroundColor: 'var(--primary-color, #735BF2)', opacity: 0.95}}
      />

      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        {confettiPieces.map((piece) => (
          <span
            key={piece.id}
            className='confetti-piece'
            style={{
              left: `${piece.left}%`,
              width: `${piece.size}px`,
              height: `${piece.size * 1.6}px`,
              backgroundColor: piece.color,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              transform: `rotate(${piece.rotate}deg)`,
            }}
          />
        ))}
      </div>

      <div className='relative z-10 w-full max-w-[360px] rounded-2xl bg-white p-6 text-center shadow-2xl'>
        <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600'>
          <Check className='h-6 w-6' />
        </div>
        <h2 className='mt-4 text-lg font-semibold text-neutralBlack'>Case Created Successfully!</h2>
        <p className='mt-3 text-sm text-textColor'>
          High 🙌 ! {patientName ? `${patientName}'s` : 'Your'} case is now submitted.
        </p>

        <div className='mt-5 space-y-2'>
          <AntdButton
            onClick={onViewDashboard}
            className='w-full h-10 rounded-lg bg-primaryColor text-white text-sm font-semibold'
            text='View Case dashboard'
          />
          {onCreateAnother ? (
            <button
              type='button'
              onClick={() => navigate('/')}
              className='w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50'
            >
              Go Dashboard
            </button>
          ) : null}
        </div>
      </div>

      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translate3d(0, -10vh, 0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translate3d(0, 110vh, 0) rotate(360deg);
            opacity: 0;
          }
        }

        .confetti-piece {
          position: absolute;
          top: -12vh;
          border-radius: 2px;
          opacity: 0;
          animation-name: confetti-fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          animation-fill-mode: both;
        }
      `}</style>
    </div>,
    portalTarget
  )
}

export default CaseSubmittedSuccessModal
