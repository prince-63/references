import React from 'react'
import {Invitation} from '../types/labs.types'
import DropDownOutline from 'assets/icons/DropDownOutline'
import getColorPalette from 'utils/getColorPalette'
import InfoIcon from 'assets/icons/InfoIcon'
import CrossIcon from 'assets/icons/CrossIcon'
import CheckMarkIcon from 'assets/icons/CheckMarkIcon'
import dayjs from 'dayjs'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {
  setOpenAcceptModal,
  setOpenRejectModal,
  setSelectedLab,
} from 'redux/Slices/AppSlice/Labs/labs.slice'
import useDispatchAction from '@hooks/useDispatchAction'
import LinkSimpleIcon from 'assets/icons/LinkSimpleIcon'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import copy from 'copy-to-clipboard'
import When from 'components/when/When'
import getBrandConfig from 'utils/getBrandConfig'
import useAllUserPlan from '@hooks/useAllUserPlan'
import Tag from 'components/tags/Tag'

const GetInviteButtonDetails = ({
  lab,
  sendInvite,
}: {
  lab: Invitation
  sendInvite: (lab: Invitation) => void
}) => {
  const {loadingLabList} = useSelector((state: RootState) => state.labs)
  const {dispatchAction} = useDispatchAction()
  const {isEnterprisePlanUser, isGrowthPlanUser} = useAllUserPlan()
  const shouldShowInviteLink = !lab.profile_id

  function getHoursDifference(dateInSec: number): number {
    const now = dayjs()
    const past = dayjs(dateInSec)
    return now.diff(past, 'hour')
  }

  if (lab.is_received_invitation) {
    if (lab.status === 'ACCEPTED') {
      return isGrowthPlanUser ? (
        <Tag
          value='Connected'
          className='text-xs font-semibold text-tertiaryColor bg-tertiarySupport'
        />
      ) : null
    }
    return (
      <>
        {lab.status === 'REJECTED' ? (
          <div className='flex gap-1 text-red text-sm'>
            <InfoIcon width='16' height='16' color='red' />
            <div> Rejected</div>
          </div>
        ) : (
          <div className='flex gap-2'>
            <button
              className='flex gap-1 items-center text-red border border-red bg-redSupport text-sm font-medium px-2 py-1 rounded-lg'
              onClick={() => {
                dispatchAction(setSelectedLab(lab))
                dispatchAction(setOpenRejectModal(true))
              }}
            >
              <CrossIcon color={getColorPalette().red} />
              <div>Reject</div>
            </button>

            <button
              className='flex gap-1 items-center text-tertiaryColor border border-tertiaryColor bg-tertiarySupport px-2 py-1 rounded-lg'
              onClick={() => {
                dispatchAction(setSelectedLab(lab))
                dispatchAction(setOpenAcceptModal(true))
              }}
            >
              <CheckMarkIcon color={getColorPalette().tertiaryColor} width='12' />
              <div>Accept</div>
            </button>
          </div>
        )}
      </>
    )
  }
  if (lab.status === 'REJECTED' && !lab.is_received_invitation) {
    return (
      <div className='flex items-center gap-2'>
        <div className='flex items-center justify-center gap-1 text-red text-sm'>
          <InfoIcon width='16' height='16' color='red' />
          <div> Rejected</div>
        </div>
        <div className='flex items-center justify-center gap-2'>
          <button
            className='flex gap-1 items-center text-primaryColor'
            onClick={() => sendInvite(lab)}
            disabled={loadingLabList}
          >
            <div>Resend</div>
            <div className='-rotate-90'>
              <DropDownOutline color={getColorPalette().primaryColor} />
            </div>
          </button>
          <When isTrue={lab.registration_type === 'NEW_USER_INVITED' && shouldShowInviteLink}>
            <CopyLinkButton code={lab.invitation_code} />
          </When>
        </div>
      </div>
    )
  }

  if (lab.last_invitation_at === null && isEnterprisePlanUser) {
    return (
      <button
        className='flex gap-2 items-center text-primaryColor'
        disabled={loadingLabList}
        onClick={() => sendInvite(lab)}
      >
        <div>Send Invite</div>
        <div className='-rotate-90'>
          <DropDownOutline color={getColorPalette().primaryColor} />
        </div>
      </button>
    )
  }

  const hoursSinceLastInvite = getHoursDifference(new Date(lab.last_invitation_at).getTime())

  if (hoursSinceLastInvite < 24) {
    const remainingHours = 24 - hoursSinceLastInvite
    return (
      <div className='flex gap-2 items-center'>
        <button className='flex gap-1 items-center text-textColor' disabled>
          <InfoIcon width='16' height='16' />
          <div>Resend Invite in {remainingHours}h</div>
        </button>
        <When isTrue={shouldShowInviteLink}>
          <CopyLinkButton code={lab.invitation_code} />
        </When>
      </div>
    )
  }

  if (!isEnterprisePlanUser) {
    return null
  }

  return (
    <div className='flex gap-2 items-center'>
      <button
        className='flex gap-2 items-center text-primaryColor'
        onClick={() => sendInvite(lab)}
        disabled={loadingLabList}
      >
        <div>Resend invite</div>
        <div className='-rotate-90'>
          <DropDownOutline color={getColorPalette().primaryColor} />
        </div>
      </button>

      <When isTrue={lab.registration_type === 'NEW_USER_INVITED' && shouldShowInviteLink}>
        <CopyLinkButton code={lab.invitation_code} />
      </When>
    </div>
  )
}

export default GetInviteButtonDetails

const CopyLinkButton = ({code}: {code: string}) => {
  return (
    <button
      onClick={() => {
        SuccessToast('Link copied!')
        copy(getBrandConfig().inviteLink + code + '/connect')
      }}
    >
      <LinkSimpleIcon width='22' height='22' color={getColorPalette().primaryColor} />
    </button>
  )
}
