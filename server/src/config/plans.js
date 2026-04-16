/**
 * Subscription plan constants.
 * Replace the price IDs with your actual Stripe Price IDs from the dashboard.
 */

export const PLANS = {
  monthly: {
    id: 'monthly',
    name: 'Monthly',
    priceId: process.env.STRIPE_PRICE_MONTHLY || 'price_monthly_id',
    amount: 999,      // £9.99 in pence
    currency: 'gbp',
    interval: 'month',
    features: [
      'Stableford score tracking',
      'Monthly prize draw entry',
      'Charity contribution',
      'Full dashboard access',
    ],
  },
  annual: {
    id: 'annual',
    name: 'Annual',
    priceId: process.env.STRIPE_PRICE_ANNUAL || 'price_annual_id',
    amount: 8999,     // £89.99 in pence  (save ~25%)
    currency: 'gbp',
    interval: 'year',
    features: [
      'Everything in Monthly',
      'Save 25% vs monthly',
      'Priority draw entry',
      'Exclusive annual events',
    ],
  },
};

/**
 * Look up a plan by its Stripe Price ID.
 */
export const getPlanByPriceId = (priceId) =>
  Object.values(PLANS).find((p) => p.priceId === priceId) || null;
