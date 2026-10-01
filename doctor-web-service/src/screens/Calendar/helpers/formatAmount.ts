export default (amount: string | number | undefined): string | undefined => {
  if (!amount) return undefined

  const amountStr = typeof amount === 'number' ? amount.toString() : amount

  let formattedAmount = amountStr?.replace(/\D/g, '')
  if (formattedAmount) {
    formattedAmount = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseInt(formattedAmount, 10))
  }
  return formattedAmount
}
