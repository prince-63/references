import {toast} from 'react-toastify'

function InfoToast(title: any) {
  return toast.info(title, {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'light',
  })
}

export default InfoToast
