import {toast} from 'react-toastify'

function SuccessToast(title: any) {
  return toast.success(title, {
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

export default SuccessToast
