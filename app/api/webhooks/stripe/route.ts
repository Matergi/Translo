import { headers } from "next/headers"
import {
  PaymentType,
  proPlanTokens,
  tokensPerCent,
} from "@/constants/subscriptions"
import Stripe from "stripe"

import { env } from "@/env.mjs"
import {
  PaymentAction,
  eventPayments,
  sendServerPostHogEvent,
} from "@/lib/analytics-server"
import { db } from "@/lib/db"
import i18n from "@/lib/i18n"
import { SuccessResponse } from "@/lib/response"
import { stripe } from "@/lib/stripe"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error) {
    return new Response(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  if (event.type === "checkout.session.completed") {
    // recharge tokens
    if (session?.metadata?.type === PaymentType.RechargeTokens) {
      const user = await db.user.findFirst({
        where: {
          id: session?.metadata?.userId,
        },
      })

      if (!user) {
        return new Response(i18n.t("Stripe payment user not found"), {
          status: 400,
        })
      }

      sendServerPostHogEvent((client) => {
        eventPayments(user.id, client, PaymentAction.recharged, {
          amount: event.data.object["amount_total"] / 100,
        })
      })

      await db.user.update({
        where: {
          id: user.id,
        },
        data: {
          tokens:
            Number(user.tokens) +
            event.data.object["amount_total"] * tokensPerCent,
        },
      })
    } else {
      // Retrieve the subscription details from Stripe.
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      )

      const user = await db.user.findFirst({
        where: {
          id: session?.metadata?.userId,
        },
      })

      if (!user) {
        return new Response(i18n.t("Stripe payment user not found"), {
          status: 400,
        })
      }

      sendServerPostHogEvent((client) => {
        eventPayments(user.id, client, PaymentAction.subscriptionCreated)
      })

      // Update the user stripe into in our database.
      // Since this is the initial subscription, we need to update
      // the subscription id and customer id.
      await db.user.update({
        where: {
          id: session?.metadata?.userId,
        },
        data: {
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
          tokens: user.stripeSubscriptionId
            ? user.tokens
            : Number(user.tokens) + proPlanTokens,
        },
      })
    }
  }

  if (event.type === "invoice.payment_succeeded") {
    // Retrieve the subscription details from Stripe.
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    )

    // Update the price id and set the new period end.
    await db.user.update({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ),
      },
    })
  }

  return SuccessResponse()
}
