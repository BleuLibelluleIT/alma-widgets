import { EligibilityPlan } from '../types';
export declare function priceToCents(price: number): number;
export declare function priceFromCents(cents: number): number;
export declare function formatCents(cents: number): string;
export declare const secondsToMilliseconds: (date: number) => number;
export declare const desktopWidth = 800;
export declare const isP1X: (plan: EligibilityPlan) => boolean;
