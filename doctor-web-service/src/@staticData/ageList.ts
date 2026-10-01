const ageList = Array.from({length: 95}, (_, i) => {
  const age = i + 5
  return {label: age.toString(), value: age.toString()}
})

export default ageList
