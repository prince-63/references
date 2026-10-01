import {toast} from 'react-toastify'

function ErrorToast(title: any) {
  return toast.error(title, {
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

export default ErrorToast
