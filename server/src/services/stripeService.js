// Placeholder — Stripe service
// Will wrap Stripe SDK calls: create customer, create subscription,
// handle webhooks, process refunds, etc.

import stripe from '../config/stripe.js';

export const createCustomer = async (email, name) => {
  return stripe.customers.create({ email, name });
};

export const createCheckoutSession = async (customerId, priceId) => {
  // TODO: implement checkout session creation
  return null;
};
