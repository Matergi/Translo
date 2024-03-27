import Link from "next/link"

import {
  MAX_KEYWORDS_STARTER_URSER,
  MAX_PROJECTS_STARTER_URSER,
  PRO_PLAN_PRICING_MONTHLY,
  PRO_PLAN_PRICING_YEARLY,
} from "@/lib/constants"
import i18n from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"

export const metadata = {
  title: "Pricing",
}

export default function PricingPage() {
  return (
    <section className="container flex flex-col  gap-6 py-8 md:max-w-[64rem] md:py-12 lg:py-24">
      <div className="mx-auto flex w-full flex-col gap-4 md:max-w-[58rem]">
        <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
          {i18n.t("Simple, transparent pricing")}
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          {i18n.t("Unlock all features and grow your business.")}
        </p>
      </div>
      <div className="grid w-full items-start gap-10 rounded-lg border p-10 md:grid-cols-[1fr_150px_150px]">
        <div className="grid gap-6">
          <h3 className="text-xl font-bold sm:text-2xl">
            {i18n.t("What's included in the PRO plan")}
          </h3>
          <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-1">
            <li className="flex items-center">
              <Icons.check className="mr-2 h-4 w-4" />
              {i18n.t("Unlimited projects")}
            </li>
            <li className="flex items-center">
              <Icons.check className="mr-2 h-4 w-4" />
              {i18n.t("Unlimited translation")}
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-4 text-center">
          <div>
            <h4 className="text-5xl font-bold mb-2">
              {PRO_PLAN_PRICING_MONTHLY}
            </h4>
            <p className="text-sm font-medium text-muted-foreground">
              {i18n.t("Billed Monthly")}
            </p>
          </div>
          <Link href="/login" className={cn(buttonVariants({ size: "lg" }))}>
            {i18n.t("Get started")}
          </Link>
        </div>
        <div className="flex flex-col gap-4 text-center">
          <div>
            <h4 className="text-5xl font-bold mb-2">
              {PRO_PLAN_PRICING_YEARLY}
            </h4>
            <p className="text-sm font-medium text-muted-foreground">
              {i18n.t("Billed Yearly")}
            </p>
          </div>
          <Link href="/login" className={cn(buttonVariants({ size: "lg" }))}>
            {i18n.t("Get started")}
          </Link>
        </div>
      </div>
      <div className="mx-auto flex w-full flex-col gap-4 md:max-w-[58rem] mt-10">
        <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
          {i18n.t("Or try it for free")}
        </h2>
      </div>
      <div className="grid w-full items-start gap-10 rounded-lg border p-10 md:grid-cols-[1fr_150px]">
        <div className="grid gap-6">
          <h3 className="text-xl font-bold sm:text-2xl">
            {i18n.t("What's included in the Free plan")}
          </h3>
          <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-1">
            <li className="flex items-center">
              <Icons.minus className="mr-2 h-4 w-4" />
              {i18n.t("{MAX_PROJECTS_STARTER_URSER} project", {
                MAX_PROJECTS_STARTER_URSER,
              })}
            </li>
            <li className="flex items-center">
              <Icons.minus className="mr-2 h-4 w-4" />
              {i18n.t("{MAX_KEYWORDS_STARTER_URSER} keywords", {
                MAX_KEYWORDS_STARTER_URSER,
              })}
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-4 text-center">
          <div>
            <h4 className="text-5xl font-bold mb-2">{i18n.t("Free")}</h4>
          </div>
          <Link href="/login" className={cn(buttonVariants({ size: "lg" }))}>
            {i18n.t("Get started")}
          </Link>
        </div>
      </div>
    </section>
  )
}
