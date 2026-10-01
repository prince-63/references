interface FcWidget {
  open: () => void
  show: () => void
  hide: () => void
}

interface Window {
  fcWidget: FcWidget
}
