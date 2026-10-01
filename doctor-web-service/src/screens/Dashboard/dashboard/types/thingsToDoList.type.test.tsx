import thingsToDOFilterOption from '../constants/thingsToDOFilterOption'
import thingsToDoTypes from './thingsToDo.types'
import {ThingsToDoFilterOptionsRecord} from './thingsToDoList.type'

describe('thingsToDo list types', () => {
  it('keeps filter options aligned with thingsToDo types', () => {
    const values = thingsToDOFilterOption.map((option) => option.value)

    expect(new Set(values).size).toBe(values.length)
    expect(values.sort()).toEqual(Object.values(thingsToDoTypes).sort())
  })

  it('supports constructing ThingsToDoFilterOptionsRecord', () => {
    const record: ThingsToDoFilterOptionsRecord = {
      ALL: [],
      ALIGNER_CHANGE: ['aligner-change'],
      CHECK_IN: [],
      ISSUE_REPORT: ['reported-issue'],
    }

    expect(record.ALIGNER_CHANGE).toContain('aligner-change')
    expect(record.ISSUE_REPORT).toContain('reported-issue')
  })
})
