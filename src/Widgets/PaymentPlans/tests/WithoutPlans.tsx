import { screen, waitFor } from '@testing-library/react'
import { ApiMode } from 'consts'
import React from 'react'
import { act } from 'react-dom/test-utils'
import render from 'test'
import { mockButtonPlans } from 'test/fixtures'
import PaymentPlanWidget from '..'

/**
 * Test how the widget handles no defined plans.
 *
 * @param animationDuration default duration between plan switch
 */
export default function WithoutPlans(animationDuration: number): void {
  beforeEach(async () => {
    render(
      <PaymentPlanWidget
        purchaseAmount={mockButtonPlans[0].purchase_amount}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
      />,
    )
    await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
  })

  it('displays all available payment plans', () => {
    expect(screen.getByText('J+30')).toBeInTheDocument()
    expect(screen.getByText('2x')).toBeInTheDocument()
    expect(screen.getByText('3x')).toBeInTheDocument()
    expect(screen.getByText('4x')).toBeInTheDocument()
    expect(screen.getByText('10x')).toBeInTheDocument()
  })

  it(`iterates on each plan every ${animationDuration}ms then returns to the beginning`, () => {
    expect(screen.getByText(/450,00 € à payer le 21 novembre 2021/)).toBeInTheDocument()
    expect(screen.getByText(/\(sans frais\)/)).toBeInTheDocument()
    act(() => {
      jest.advanceTimersByTime(animationDuration)
    })
    expect(screen.getByText(/2 x 225,00 €/)).toBeInTheDocument()
    expect(screen.getByText(/\(sans frais\)/)).toBeInTheDocument()
    act(() => {
      jest.advanceTimersByTime(animationDuration)
    })
    expect(screen.getByText('151,35 € puis 2 x 150,00 €')).toBeInTheDocument()
    act(() => {
      jest.advanceTimersByTime(animationDuration)
    })
    expect(screen.getByText('124,52 € puis 3 x 112,50 €')).toBeInTheDocument()
    act(() => {
      jest.advanceTimersByTime(animationDuration)
    })
    expect(screen.getByText(/47,73 € puis 9 x 47,66 €/)).toBeInTheDocument()
    act(() => {
      jest.advanceTimersByTime(animationDuration)
    })
    expect(screen.getByText(/450,00 € à payer le 21 novembre 2021/)).toBeInTheDocument()
    expect(screen.getByText(/\(sans frais\)/)).toBeInTheDocument()
  })
}