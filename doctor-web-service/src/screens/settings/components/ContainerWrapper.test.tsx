import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContainerWrapper from './ContainerWrapper'

// eslint-disable-next-line react/display-name
jest.mock('components/atom/Buttons/AntdButton', () => ({text, onClick, disabled}: any) => (
  <button data-testid={`antd-${text}`} onClick={onClick} disabled={disabled}>
    {text}
  </button>
))

// eslint-disable-next-line react/display-name
jest.mock('components/atom/Buttons/EditButton', () => ({children, onClick}: any) => (
  <button data-testid='edit-btn' onClick={onClick}>
    {children}
  </button>
))

describe('ContainerWrapper', () => {
  it('renders title, subtitle, children, and edit button when not editing', async () => {
    expect.assertions(3)
    const onEdit = jest.fn()

    render(
      <ContainerWrapper title='Title' subTitle='Sub' onClickEdit={onEdit}>
        <div>Child</div>
      </ContainerWrapper>
    )

    expect(screen.getByText('Title')).toBeInTheDocument()
    await userEvent.click(screen.getByTestId('edit-btn'))
    expect(onEdit).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Child')).toBeInTheDocument()
  })

  it('shows cancel/save when editing and triggers handlers', async () => {
    expect.assertions(2)
    const onCancel = jest.fn()
    const onSave = jest.fn()

    render(
      <ContainerWrapper title='Editing' isEditClicked onClickCancel={onCancel} onClickSave={onSave}>
        <div />
      </ContainerWrapper>
    )

    await userEvent.click(screen.getByText('Cancel'))
    await userEvent.click(screen.getByTestId('antd-Save'))
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it('renders extra button when requested and respects disabled state', async () => {
    expect.assertions(2)
    const onExtra = jest.fn()

    render(
      <ContainerWrapper
        title='Buttons'
        buttonText='Create'
        onClickButton={onExtra}
        showButton
        extraButtonDisable
      >
        <div />
      </ContainerWrapper>
    )

    const extraButton = screen.getByTestId('antd-Create')
    expect(extraButton).toBeDisabled()
    await userEvent.click(extraButton)
    expect(onExtra).not.toHaveBeenCalled()
  })
})
