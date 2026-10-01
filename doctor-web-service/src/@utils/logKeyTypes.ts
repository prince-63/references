import {logToConsole} from './logToConsole'

export const logKeyTypes = (input: any): void => {
  if (Array.isArray(input)) {
    if (input.length > 0 && typeof input[0] === 'object' && input[0] !== null) {
      const firstObject = input[0]
      for (const key in firstObject) {
        if (firstObject.hasOwnProperty(key)) {
          logToConsole(`{ Key: ${key}, Type: ${typeof firstObject[key]} }`)
        }
      }
    } else {
      return
    }
  } else if (typeof input === 'object' && input !== null) {
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        logToConsole(`{ Key: ${key}, Type: ${typeof input[key]} }`)
      }
    }
  } else {
    return
  }
}
