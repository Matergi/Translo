import { redirect } from "next/navigation"

import { env } from "@/env.mjs"
import { PageAnalytics } from "@/lib/analytics-client"
import { authOptions } from "@/lib/auth"
import { getCurrentUser } from "@/lib/session"
import { stripe } from "@/lib/stripe"
import { getUserSubscriptionPlan } from "@/lib/subscription"
import { BillingForm } from "@/components/billing-form"
import { DashboardHeader } from "@/components/header"
import PostHogAnalytics from "@/components/posthog"
import { DashboardShell } from "@/components/shell"
import { getTokensByUserId } from "@/app/[lang]/api/users/utils"

export const metadata = {
  metadataBase: new URL(`${env.NEXT_PUBLIC_APP_URL}/dashboard/billing`),
  title: "Billing",
  description: "Manage billing and your subscription plan.",
}

export default async function BillingPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect(authOptions?.pages?.signIn || "/login")
  }

  const tokens = await getTokensByUserId(user.id)

  const subscriptionPlan = await getUserSubscriptionPlan(user.id)

  // If user has a pro plan, check cancel status on Stripe.
  let isCanceled = false
  if (subscriptionPlan.isPro && subscriptionPlan.stripeSubscriptionId) {
    const stripePlan = await stripe.subscriptions.retrieve(
      subscriptionPlan.stripeSubscriptionId
    )
    isCanceled = stripePlan.cancel_at_period_end
  }

  const Analytics = await PostHogAnalytics(PageAnalytics.billing)

  return (
    <>
      {Analytics}
      <DashboardShell>
        <DashboardHeader
          heading="Billing"
          text="Manage billing and your subscription plan."
        />
        <div className="grid gap-8">
          <BillingForm
            subscriptionPlan={{
              ...subscriptionPlan,
              isCanceled,
            }}
            tokens={tokens}
          />
        </div>
      </DashboardShell>
    </>
  )
}
