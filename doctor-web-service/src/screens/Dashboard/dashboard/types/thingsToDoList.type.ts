import thingsToDOFilterOption from '../constants/thingsToDOFilterOption'
import thingsToDoTypes from './thingsToDo.types'

export type ThingsToDoStatus = (typeof thingsToDOFilterOption)[number]['value']
export type ThingsToDoFilterOptionsRecord = Record<keyof typeof thingsToDoTypes, any[]>
