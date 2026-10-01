import brandNamesConstants from '@constants/brandNames.constants'
import SmilezyLogo from '../assets/images/SmilezyLogo.svg'
import imageAppLogo from '../assets/images/Dental Stack Logo.svg'
import dentalStackFavicon from '../assets/icons/DentalStackFavIcon.svg'
import smilezyFavicon from '../assets/icons/SmilezyFavIcon.svg'
import RouteToSmileLogo from '../assets/images/RtsLogo.svg'
import CraftAlignLogo from '../assets/images/CraftAlignLogo.svg'
import CraftAlignFavicon from '../assets/images/CraftAlignFavicon.png'
import RouteToSmileFavicon from '../assets/images/RouteToSmileFavicon.svg'
import SynapseLogo from '../assets/images/SynapseLogo.svg'
import SynapseFavicon from '../assets/images/SynapseFavicon.png'
import ClearCastle from '../assets/images/ClearCastleAlignersLogo.svg'
import ClearCastleFavicon from '../assets/images/ClearCastleAlignersFavIconLogo.png'
import SmileXcelFavicon from '../assets/images/SmileXcelFavicon.png'
import SmileXcelLogo from '../assets/images/SmileXcelLogo.png'
import AiiqLogo from '../assets/images/AIIQ_NEW_LOGO.png'
import AiiqFavicon from '../assets/images/AIIQ_FavIcon.png'
import ConfidentAlignerLogo from '../assets/images/ConfidentAlignerLogo.png'
import ConfidentAlignerFavicon from '../assets/images/ConfidentAlignerFavicon.png'

export default () => {
  const brand = process.env.REACT_APP_BRAND_NAME || brandNamesConstants.DENTALSTACK
  const stage = process.env.REACT_APP_BASE_ENVIRONMENT || ''

  const defaultBrandConfig = {
    name: 'Dental Stack',
    logo: imageAppLogo,
    termsAndConditions: 'https://dental-stack.com/terms-and-conditions-doctor/',
    privacyPolicy: 'https://dental-stack.com/privacy-policy/',
    brand,
    favIcon: dentalStackFavicon,
    inviteLink: `https://web.${stage}dental-stack.com/`,
    formId: '7a5a9377-c60f-45d9-881a-a07780488b88',
    bracesFormId: 'dfe6af14-3abd-447e-9962-d02e8e4d41cf',
  }

  switch (brand) {
    case brandNamesConstants.SMILEZY:
      return {
        name: 'Smilezy',
        brand: brand,
        logo: SmilezyLogo,
        favIcon: smilezyFavicon,
        termsAndConditions:
          'https://ardentous.notion.site/Terms-of-use-Smilezy-196cf197dd6a4a57bcea399f3abe931c',
        privacyPolicy:
          'https://ardentous.notion.site/Privacy-Policy-Smilezy-d59ec72f7a314d29b0c428b1e4073861',
        inviteLink:
          stage === '' ? 'https://web.smilezy.com/' : `https://smilezy.${stage}dental-stack.com/`,
        formId: '74173137-a96b-473e-8422-af896ed252a1',
      }

    case brandNamesConstants.ROUTETOSMILE:
      return {
        name: 'Route to smile',
        brand: brand,
        logo: RouteToSmileLogo,
        favIcon: RouteToSmileFavicon,
        termsAndConditions:
          'https://ardentous.notion.site/Route-to-Smile-Terms-Conditions-White-Label-1f0d9882880e800f8c45d202df6ad067',
        privacyPolicy:
          'https://ardentous.notion.site/Route-to-Smile-Privacy-Policy-White-Label-1f0d9882880e800ab0feceef409152bc',
        inviteLink:
          stage === ''
            ? 'https://web.routetosmile.com/'
            : `https://routetosmile.${stage}dental-stack.com/`,
        formId: '7a5a9377-c60f-45d9-881a-a07780488b88',
      }

    case brandNamesConstants.CRAFTALIGN:
      return {
        name: 'Craft align',
        brand: brand,
        logo: CraftAlignLogo,
        favIcon: CraftAlignFavicon,
        termsAndConditions: 'https://craftalign.com/termsconditions/',
        privacyPolicy: 'https://craftalign.com/privacy-policy/',
        inviteLink:
          stage === ''
            ? 'https://web.craftalign.com/'
            : `https://craftalign.${stage}dental-stack.com/`,
        formId: '7a5a9377-c60f-45d9-881a-a07780488b88',
      }
    case brandNamesConstants.SYNAPSE:
      return {
        name: 'OrthoSync',
        brand: brand,
        logo: SynapseLogo,
        favIcon: SynapseFavicon,
        termsAndConditions:
          'https://ardentous.notion.site/Synapse-Healthcare-Terms-Conditions-1ecd9882880e80e6bda1c5d7294812aa',
        privacyPolicy:
          'https://ardentous.notion.site/Privacy-Policy-Web-Synapse-Healthcare-1ecd9882880e8094b91ff2357dddbd57',
        inviteLink:
          stage === ''
            ? 'https://web.synapsehealthtech.in/'
            : 'https://synapsehealthtech.stage.dental-stack.com/',
        formId: '7a5a9377-c60f-45d9-881a-a07780488b88',
      }

    case brandNamesConstants.CLEARCASTLE:
      return {
        name: 'Clear Castle',
        brand: brand,
        logo: ClearCastle,
        favIcon: ClearCastleFavicon,
        termsAndConditions:
          'https://www.notion.so/ardentous/Clear-Castle-Aligners-Terms-Conditions-242d9882880e80d49e0ed0931faaae57',
        privacyPolicy:
          'https://www.notion.so/ardentous/Clear-Castle-Aligners-Privacy-Policy-242d9882880e80af85c7f04282308713',
        inviteLink:
          stage === ''
            ? 'https://doctors.clearcastle.in/'
            : `https://clearcastle.stage.dental-stack.com/`,
        formId: '7a5a9377-c60f-45d9-881a-a07780488b88',
      }

    case brandNamesConstants.SMILEXCEL:
      return {
        name: 'Smilexcel',
        brand: brand,
        logo: SmileXcelLogo,
        favIcon: SmileXcelFavicon,
        termsAndConditions:
          'https://ardentous.notion.site/Smilexcel-Clear-Aligners-Terms-Conditions-2b0d9882880e8171a31fd3975627daaf',
        privacyPolicy:
          'https://ardentous.notion.site/Smilexcel-Clear-Aligners-Privacy-Policy-2b0d9882880e81e39f5ac274f9d855bd',
        inviteLink:
          stage === ''
            ? 'https://doctors.smilexcel.com/'
            : `https://smilexcel.stage.dental-stack.com/`,
        formId: '7a5a9377-c60f-45d9-881a-a07780488b88',
      }
    case brandNamesConstants.AIIQALIGNER:
      return {
        name: 'AIIQ ALIGNER',
        brand: brand,
        logo: AiiqLogo,
        favIcon: AiiqFavicon,
        termsAndConditions:
          'https://ardentous.notion.site/AIIQ-Aligner-Terms-Conditions-2e2d9882880e81238562c53a08018196?source=copy_link',
        privacyPolicy:
          'https://ardentous.notion.site/AIIQ-Aligner-Privacy-Policy-2e2d9882880e81bf93b2f9956337d092?source=copy_link',
        inviteLink: stage === '' ? 'https://doctors.aiiqaligner.com/' : '',
        formId: 'd5b11a4b-9205-40d8-81a4-cf32ec435b02',
      }

    case brandNamesConstants.CONFIDENTALIGNER:
      return {
        name: 'CONFIDENT ALIGNER',
        brand: brand,
        logo: ConfidentAlignerLogo,
        favIcon: ConfidentAlignerFavicon,
        termsAndConditions:
          'https://www.notion.so/ardentous/Confi-Aligners-Terms-Conditions-349d9882880e800698a2c93fef229c7b',
        privacyPolicy:
          'https://www.notion.so/ardentous/Confi-Aligners-Privacy-Policy-349d9882880e803c96c8f7721e1f7a8c',
        inviteLink: stage === '' ? 'https://confialign.confidentlab.com/' : '',
        formId: '7a5a9377-c60f-45d9-881a-a07780488b88',
      }
    default:
      return defaultBrandConfig
  }
}
