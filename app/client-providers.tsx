"use client"

import { createContext, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SessionProvider } from "next-auth/react"
import { AppProgressBar as ProgressBar } from "next-nprogress-bar"

import { AlertType, ShowAlertType } from "@/types/api"
import i18n from "@/lib/i18n"
import { TooltipProvider } from "@/components/ui/tooltip"
import KeywordsSubscriptionNeededAlert from "@/components/app/globalAlert/keywordsSubscriptionNeededAlert"
import ProjectSubscriptionNeededAlert from "@/components/app/globalAlert/projectSubscriptionNeededAlert"

const queryClient = new QueryClient()

export const AlertContext = createContext<{
  alert?: AlertType
  showAlert: ShowAlertType
}>({
  showAlert: () => {},
})

export default function ClientProvider(props: { children: React.ReactNode }) {
  i18n.changeLanguage("en")

  const [alert, showAlert] = useState<AlertType | undefined>()

  return (
    <TooltipProvider delayDuration={100}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <AlertContext.Provider value={{ alert, showAlert }}>
            <ProjectSubscriptionNeededAlert />
            <KeywordsSubscriptionNeededAlert />
            {props.children}
          </AlertContext.Provider>
          <ProgressBar
            height="2px"
            color="#44403c"
            options={{ showSpinner: false }}
            shallowRouting
          />
        </SessionProvider>
      </QueryClientProvider>
    </TooltipProvider>
  )
}
