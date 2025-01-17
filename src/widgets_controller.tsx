import { ApiMode } from 'consts'
import IntlProvider from 'intl/IntlProvider'
import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import {
  Locale,
  ModalOptions,
  PaymentPlanWidgetOptions,
  WidgetNames,
  WidgetOptions,
  widgetTypes,
} from 'types'
import ModalContainer from 'Widgets/EligibilityModal/ModalContainer'
import PaymentPlanWidget from 'Widgets/PaymentPlans'

export type AddReturnType =
  | {
      open: () => void
      close: () => void
    }
  | undefined

export class WidgetsController {
  constructor(private readonly apiData: { domain: ApiMode; merchantId: string }) {}

  add(widget: WidgetNames, options: WidgetOptions): AddReturnType {
    const containerDiv = document.querySelector(options.container)

    if (containerDiv) {
      unmountComponentAtNode(containerDiv)
    }

    if (widget === widgetTypes.PaymentPlans) {
      const {
        container,
        purchaseAmount,
        plans,
        transitionDelay,
        hideIfNotEligible,
        hideBorder = false,
        monochrome = true,
        suggestedPaymentPlan,
        customerBillingCountry,
        customerShippingCountry,
        locale = Locale.en,
        cards,
      } = options as PaymentPlanWidgetOptions

      if (containerDiv) {
        render(
          <IntlProvider locale={locale}>
            <PaymentPlanWidget
              apiData={this.apiData}
              configPlans={plans}
              hideIfNotEligible={hideIfNotEligible}
              monochrome={monochrome}
              purchaseAmount={purchaseAmount}
              suggestedPaymentPlan={suggestedPaymentPlan}
              cards={cards}
              customerBillingCountry={customerBillingCountry}
              customerShippingCountry={customerShippingCountry}
              transitionDelay={transitionDelay}
              hideBorder={hideBorder}
            />
          </IntlProvider>,
          document.querySelector(container),
        )
      }
    }

    if (widget === widgetTypes.Modal) {
      const {
        container,
        clickableSelector,
        purchaseAmount,
        plans,
        locale = Locale.en,
        customerBillingCountry,
        customerShippingCountry,
        cards,
        onClose,
      } = options as ModalOptions

      const close = () => {
        if (!containerDiv) return
        unmountComponentAtNode(containerDiv)
        onClose()
      }

      const renderModal = () => {
        render(
          <IntlProvider locale={locale}>
            <ModalContainer
              purchaseAmount={purchaseAmount}
              apiData={this.apiData}
              configPlans={plans}
              customerBillingCountry={customerBillingCountry}
              customerShippingCountry={customerShippingCountry}
              onClose={close}
              cards={cards}
            />
          </IntlProvider>,
          document.querySelector(container),
        )
      }

      // if clickableSelector is provided, add an onClick event handler to open the Modal.
      if (clickableSelector) {
        document.querySelector(clickableSelector)?.addEventListener('click', renderModal, false)
      }

      return {
        open: renderModal,
        close,
      }
    }
  }
}
