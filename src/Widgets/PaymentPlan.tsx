import LogoIcon from 'assets/Logo'
import cx from 'classnames'
import Loader from 'components/Loader'
import useButtonAnimation from 'hooks/useButtonAnimation'
import useFetchEligibility from 'hooks/useFetchEligibility'
import React, { useState } from 'react'
import { ApiConfig, apiStatus, configPlans } from 'types'
import { paymentPlanInfoText, paymentPlanShorthandName } from 'utils/paymentPlanStrings'
import EligibilityModal from './EligibilityModal'
import s from './PaymentPlan.module.css'

type Props = {
  purchaseAmount: number
  apiData: ApiConfig
  configPlans?: configPlans[]
  transitionDelay?: number
  hideIfNotApplicable?: boolean
}

const PaymentPlanWidget: React.FC<Props> = ({
  purchaseAmount,
  apiData,
  configPlans,
  transitionDelay,
  hideIfNotApplicable,
}) => {
  const [eligibilityPlans, status] = useFetchEligibility(purchaseAmount, apiData, configPlans)

  const [isOpen, setIsOpen] = useState(false)
  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  const activePlanKeys = eligibilityPlans
    .map((plan, key) => {
      if (plan.eligible) return key
      return undefined
    })
    .filter((key) => key !== undefined) as number[]

  const { current, onHover, onLeave } = useButtonAnimation(
    activePlanKeys,
    transitionDelay ? transitionDelay : 5500,
  )
  if (hideIfNotApplicable && eligibilityPlans.length == 0) {
    return null
  }
  if (status === apiStatus.PENDING) {
    return (
      <div className={cx(s.widgetButton, s.pending)}>
        <Loader />
      </div>
    )
  }

  if (status === apiStatus.FAILED) {
    return null
  }

  return (
    <>
      <button onClick={openModal} className={s.widgetButton} data-testid="widget-button">
        <div className={s.primaryContainer}>
          <LogoIcon className={s.logo} />
          <div className={s.paymentPlans}>
            {eligibilityPlans.map((eligibilityPlan, key) => (
              <div
                onMouseOver={() => onHover(key)}
                onMouseOut={() => onLeave()}
                key={key}
                className={cx(s.plan, {
                  [s.active]: current === key,
                  [s.notEligible]: !eligibilityPlan.eligible,
                })}
              >
                {paymentPlanShorthandName(eligibilityPlan)}
              </div>
            ))}
          </div>
        </div>
        <div
          className={cx(s.info, {
            [s.notEligible]: eligibilityPlans[current] && !eligibilityPlans[current].eligible,
          })}
        >
          {eligibilityPlans.length !== 0 && paymentPlanInfoText(eligibilityPlans[current])}
        </div>
      </button>
      <EligibilityModal
        isOpen={isOpen}
        onClose={closeModal}
        eligibilityPlans={eligibilityPlans.filter((plan) => plan.eligible)}
      />
    </>
  )
}
export default PaymentPlanWidget
