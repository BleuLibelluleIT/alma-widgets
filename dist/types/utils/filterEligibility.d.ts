import { ConfigPlan, EligibilityPlan, EligibilityPlanToDisplay } from 'types';
declare const filterEligibility: (eligibilities: EligibilityPlan[], configPlans?: ConfigPlan[] | undefined) => EligibilityPlanToDisplay[];
export default filterEligibility;
