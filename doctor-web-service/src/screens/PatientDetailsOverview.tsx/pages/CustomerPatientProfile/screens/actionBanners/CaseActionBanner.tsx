import {ArrowRight, X} from 'lucide-react'
import clsx from 'clsx'

import useAllUserPlan from '@hooks/useAllUserPlan'
import PracticeActionBanners from './components/PracticeActionBanners'
import LabCaseActionBanner from './components/LabCaseActionBanner'

const CaseActionBanner = () => {
  const {isPractice} = useAllUserPlan()
  return isPractice ? <PracticeActionBanners /> : <LabCaseActionBanner />
}

export default CaseActionBanner

/* ─────────────── Sub-components ─────────────── */

type Variant = 'purple' | 'red' | 'blue'

export const variantStyles: Record<Variant, {wrapper: string; button: string}> = {
  purple: {
    wrapper: 'bg-primarySupport border-primaryColor',
    button: 'bg-primaryColor hover:bg-primaryColor text-white',
  },
  red: {
    wrapper: 'bg-redSupport border-red',
    button: 'bg-red hover:bg-red text-white',
  },
  blue: {
    wrapper: 'bg-secondarySupport border-secondaryColor',
    button: 'bg-secondaryColor hover:bg-secondaryColor text-white',
  },
}

export const BannerWrapper = ({
  children,
  variant,
}: {
  children: React.ReactNode
  variant: Variant
}) => (
  <div
    className={clsx(
      'w-full flex items-start md:flex-row flex-col md:items-center justify-between gap-3 rounded-xl border px-4 py-3',
      variantStyles[variant].wrapper
    )}
  >
    {children}
  </div>
)

export const BannerCTA = ({
  label,
  variant,
  onClick,
}: {
  label: string
  variant: Variant
  onClick: () => void
}) => (
  <button
    type='button'
    onClick={onClick}
    className={clsx(
      'shrink-0 flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
      variantStyles[variant].button
    )}
  >
    {label}
    {label === '' ? <X size={15} /> : <ArrowRight size={15} />}
  </button>
)
