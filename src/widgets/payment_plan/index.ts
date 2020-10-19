import './styles.scss';

import {EligibleEligibility} from "alma-js-client/dist/types/entities/eligibility";

import {Widget} from "../base";
import {DOMContent, integer} from "../../types";
import {Client} from "alma-js-client";
import {setDOMContent} from "../../utils";
import defaultTemplates from './default_templates';
import {PaymentPlanConfig, PaymentPlanSettings, PaymentPlanWidgetClasses} from "./types";
import {WidgetFactoryFunc} from "../types";

const defaultClasses: PaymentPlanWidgetClasses = {
  root: "alma-payment_plan",
  title: "alma-payment_plan--title",
  infoButton: "alma-payment_plan--info_btn",
  paymentPlan: {
    root: "alma-payment_plan--plan",
    installmentsCount: "alma-payment_plan--installments_count",
    installmentsWrapper: "alma-payment_plan--installments",
    installmentAmount: "alma-payment_plan--installment",
  },
  notEligible: "alma-payment_plan--not_eligible"
};

export class PaymentPlanWidget extends Widget {
  constructor(almaClient: Client, options: PaymentPlanSettings) {
    // Inject default templates into the given options
    options = {
      ...options,
      templates: {
        ...defaultTemplates,
        ...options.templates,
      },
      classes: {
        ...defaultClasses,
        ...options.classes,
      }
    };

    super(almaClient, options);
  }


  get config(): PaymentPlanConfig {
    return {...this._config} as PaymentPlanConfig;
  }

  get installmentsCounts(): integer[] {
    let installmentsCounts = this.config.installmentsCount;

    if (typeof this.config.installmentsCount === "number") {
      installmentsCounts = [this.config.installmentsCount];
    }

    return installmentsCounts as integer[];
  }

  protected async prepare(almaClient: Client): Promise<any> {
    const options = this._config as PaymentPlanConfig;
    const installmentsCount = this.installmentsCounts;

    if (
      options.purchaseAmount < options.minPurchaseAmount ||
      options.purchaseAmount > options.maxPurchaseAmount
    ) {
      return [{
        eligible: false,
        reasons: {
          purchase_amount: "invalid_value"
        },
        constraints: {
          purchase_amount: {
            minimum: options.minPurchaseAmount,
            maximum: options.maxPurchaseAmount
          }
        }
      }];
    }

    return almaClient.payments.eligibility({
      payment: {
        purchase_amount: options.purchaseAmount,
        installments_count: installmentsCount
      }
    });
  }

  protected async render(renderingContext: any, createWidget: WidgetFactoryFunc): Promise<DOMContent> {
    let root = document.createElement("div");
    root.className = this.config.classes.root;

    let eligiblePlans: EligibleEligibility[] = [];
    let minEligible: integer = Number.MAX_VALUE;
    let maxEligible: integer = Number.MIN_VALUE;

    for (let eligibility of renderingContext) {
      if (eligibility.eligible) {
        eligiblePlans.push(eligibility);
      } else if (!eligibility.reasons.installments_count) {
        let min = Math.max(this.config.minPurchaseAmount || 0, eligibility.constraints.purchase_amount.minimum);
        let max = Math.min(this.config.maxPurchaseAmount || 0, eligibility.constraints.purchase_amount.maximum);

        minEligible = min < minEligible ? min : minEligible;
        maxEligible = max > maxEligible ? max : maxEligible;
      }
    }

    if (eligiblePlans.length > 0) {
      let titleRoot = document.createElement("div");
      titleRoot.className = this.config.classes.title;
      setDOMContent(titleRoot, this.config.templates.title(eligiblePlans, this.config, createWidget));
      setDOMContent(root, titleRoot);

      for (let eligibility of eligiblePlans) {
        let plan = document.createElement("div");
        plan.className = this.config.classes.paymentPlan.root;
        setDOMContent(plan, this.config.templates.paymentPlan(eligibility, this.config, createWidget));

        root.appendChild(plan);
      }
    } else {
      let notEligibleRoot = document.createElement("div");
      notEligibleRoot.className = this.config.classes.notEligible;
      setDOMContent(
        notEligibleRoot,
        this.config.templates.notEligible(
          minEligible,
          maxEligible,
          this.installmentsCounts,
          this.config,
          createWidget
        )
      );

      setDOMContent(root, notEligibleRoot);
    }

    return root;
  }
}

export default PaymentPlanWidget;