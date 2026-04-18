/**
 * Map a profiles row (snake_case from PostgREST) to the JSON shape the React app expects.
 */
export function profileToClient(p) {
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    email: p.email,
    role: p.role,
    stripeCustomerId: p.stripe_customer_id ?? null,
    stripeSubscriptionId: p.stripe_subscription_id ?? null,
    subscriptionStatus: p.subscription_status ?? 'inactive',
    subscriptionPlan: p.subscription_plan ?? null,
    subscriptionExpiry: p.subscription_expiry ?? null,
    charityId: p.charity_id ?? null,
    contributionPercent: p.contribution_percent ?? 10,
    country: p.country ?? 'IE',
    currency: p.currency ?? 'EUR',
    accountType: p.account_type ?? 'individual',
    createdAt: p.created_at ?? null,
  };
}
