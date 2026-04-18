export const PLANS = {
  monthly: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID || process.env.STRIPE_PRICE_MONTHLY,
    name: 'Monthly',
    interval: 'month',
  },
  yearly: {
    priceId: process.env.STRIPE_YEARLY_PRICE_ID || process.env.STRIPE_PRICE_ANNUAL,
    name: 'Yearly',
    interval: 'year',
  },
  /** Back-compat with older client sending `annual` */
  annual: {
    priceId: process.env.STRIPE_YEARLY_PRICE_ID || process.env.STRIPE_PRICE_ANNUAL,
    name: 'Yearly',
    interval: 'year',
  },
};

export const getPlanByPriceId = (priceId) =>
  Object.values(PLANS).find((p) => p.priceId && p.priceId === priceId) || null;
