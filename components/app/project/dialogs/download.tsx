import { useContext, useState } from "react"
import Link from "next/link"

import { eventPostHogClient, UserDoClientAction } from "@/lib/analytics-client"
import i18n from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { useShareProject } from "@/hooks/api/project/use-share-project"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { AlertContext } from "@/app/[lang]/client-providers"

import { DownloadFormat } from "../useTranslation"

type DownloadKeywordsDropdownMenuProps = {
  id: string
  languages: string[]
  isPublished: boolean
  download: (format: DownloadFormat) => void
}

export function DownloadKeywordsDropdownMenu(
  props: DownloadKeywordsDropdownMenuProps
) {
  const { id, languages, isPublished, download } = props

  const [isShared, setShared] = useState(isPublished)

  const origin = typeof document !== "undefined" ? document.location.origin : ""

  const alertContext = useContext(AlertContext)

  const { mutate: shareProject } = useShareProject({
    projectId: id,
    showAlertType: alertContext.showAlert,
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            buttonVariants({ variant: "secondary" }),
            "outline-none mr-4"
          )}
        >
          <span>{i18n.t("Download")}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="truncate text-m pt-3">
              {i18n.t("Share your project:")}
            </p>
            <div className="flex items-center space-x-2 pt-3">
              <Switch
                id="airplane-mode"
                checked={isShared}
                onCheckedChange={(shared) => {
                  eventPostHogClient(UserDoClientAction.shareProject, {
                    shared,
                  })
                  setShared(shared)
                  shareProject(shared)
                }}
              />
              <Label htmlFor="airplane-mode">
                {isShared ? i18n.t("Shared") : i18n.t("Private")}
              </Label>
            </div>
            <p className="truncate text-sm pt-3">{i18n.t("Base url:")}</p>
            <p className="truncate text-sm text-muted-foreground">
              {i18n.t("project.baseurl", {
                base: origin,
                id,
              })}
            </p>
            <p className="truncate text-sm pt-3">{i18n.t("complete urls:")}</p>
            {languages.map((language) => (
              <p
                key={language}
                className="truncate text-sm text-muted-foreground"
              >
                {i18n.t("project.completeUrl", {
                  base: origin,
                  id,
                  language,
                })}
              </p>
            ))}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          asChild
          className="hover:cursor-pointer flex"
          onClick={() => {
            download(DownloadFormat.json_files)
          }}
        >
          <p>{i18n.t("Download .json files")}</p>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="hover:cursor-pointer">
          <Link
            target="_blank"
            href="https://github.com/Matergi/Translo/pull/27/files"
          >
            {i18n.t("TS code")}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
