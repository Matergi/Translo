import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  I18nInfo,
  I18nLang,
  Language,
  ProjectSettings,
  useI18nState,
} from "@/store/useI18nState"
import FileSaver from "file-saver"
import JSZip from "jszip"

import { MAX_KEYWORDS_STARTER_URSER } from "@/lib/constants"
import i18nLib from "@/lib/i18n"

import { EditorProps } from "."
import { toast } from "../../ui/use-toast"
import { NewKeyword } from "./dialogs/add-new-keyword"
import { ImportKeywords } from "./dialogs/import-keywords"

type LanguagesAvailable = {
  language: string
  available: boolean
  short: string
}

type KeywordLanguage = {
  value: string
  language: string
  short: string
}

export type Keyword = {
  key: string
  info?: I18nInfo
  languages: KeywordLanguage[]
  languagesAvailable: LanguagesAvailable[]
}

export enum DownloadFormat {
  json_files = "json_files",
}

const useTranslation = (props: EditorProps) => {
  const {
    i18n,
    editTranslation: editTranslationStore,
    addKey,
    deleteKey,
    setI18n,
    setTitle,
    editContext,
    editSettings,
    editKey,
    addLanguage,
    editLanguage,
    deleteLanguage,
    addNewConstantTranslation,
    importKeys: _importKeys,
  } = useI18nState()

  const keywords = useMemo((): Keyword[] => {
    if (!i18n.info || !i18n.info.length) {
      return []
    }

    const allKeywords = i18n.info.map((info) => info.key)

    return allKeywords.map((keyword) => ({
      key: keyword,
      info: (i18n.info as I18nInfo[]).find((info) => info.key === keyword),
      languages: i18n.languages.map((language) => {
        return {
          value: language.keywords[keyword],
          language: language.lang,
          short: language.short,
        }
      }),
      languagesAvailable: (i18n.languages as I18nLang[]).map((language) => ({
        language: language.lang,
        short: language.short,
        available: !!language.keywords[keyword],
      })),
    }))
  }, [i18n.info, i18n.languages])

  useEffect(() => {
    setI18n({
      title: props.project.title,
      languages: (props.project.languages || []) as I18nLang[],
      info: (props.project.info || []) as I18nInfo[],
      settings: props.project.settings as ProjectSettings,
      published: props.project.published,
    })
  }, [props.project, setI18n])

  const router = useRouter()

  // const [pauseAutocomplete, setPauseAutocomplete] = useState(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  const addNewKey = useCallback(
    (keyword: NewKeyword) => {
      if (keywords.length + 1 > MAX_KEYWORDS_STARTER_URSER) {
        toast({
          title: i18nLib.t("Limit of {number} keywords reached.", {
            number: MAX_KEYWORDS_STARTER_URSER,
          }),
          description: i18nLib.t("Please upgrade to the PRO plan."),
          variant: "destructive",
        })
        return
      }
      addKey(keyword)
    },
    [addKey, keywords.length]
  )

  const importKeys = useCallback(
    (keywords: ImportKeywords, languageRef: string) => {
      _importKeys(keywords, languageRef)
    },
    [_importKeys]
  )

  // const setChatGPTPause = () => {
  //   setPauseAutocomplete(true)
  //   setTimeout(() => {
  //     setPauseAutocomplete(false)
  //   }, 10000)
  // }

  // const { mutate, isLoading } = useMutation({
  //   mutationFn: async () => await autocompleteI18nObject(i18n),
  //   onSuccess: (data: I18n) => {
  //     setI18n(data)
  //     setChatGPTPause()
  //   },
  //   onError: () => {
  //     setChatGPTPause()
  //   },
  // })

  // const autocomplete = useCallback(() => {
  //   mutate()
  // }, [mutate])

  // const autocompleteButtonText = useMemo(() => {
  //   if (isLoading) {
  //     return <Spinner />
  //   }
  //   return pauseAutocomplete ? "need to recharge ChatGPT..." : "Autogenerate"
  // }, [isLoading, pauseAutocomplete])

  const downloadFiles = useCallback(() => {
    const zip = new JSZip()

    i18n.languages.forEach((language: I18nLang) => {
      zip.file(
        `${language.short}.json`,
        JSON.stringify(language.keywords, null, 4)
      )
    })

    zip.generateAsync({ type: "blob" }).then(function (content) {
      FileSaver.saveAs(
        content,
        `${props.project.title.replaceAll(" ", "-")}-translations.zip`
      )
    })
  }, [i18n.languages, props.project.title])

  const download = useCallback(
    (format: DownloadFormat) => {
      switch (format) {
        case DownloadFormat.json_files:
          downloadFiles()
          break
      }
    },
    [downloadFiles]
  )

  const editTranslation = useCallback(
    (language: string, key: string, value: string) => {
      editTranslationStore(language, key, value)
    },
    [editTranslationStore]
  )

  const save = useCallback(async () => {
    setIsSaving(true)

    const response = await fetch(`/api/projects/${props.project.id}`, {
      method: "PATCH",
      headers: {
        "languages-Type": "application/json",
      },
      body: JSON.stringify(i18n),
    })

    setIsSaving(false)

    if (!response?.ok) {
      return toast({
        title: "Something went wrong.",
        description: "Your project was not saved. Please try again.",
        variant: "destructive",
      })
    }

    router.refresh()

    return toast({
      description: "Your project has been saved.",
    })
  }, [i18n, props.project.id, router])

  const publishProject = useCallback(
    async (isPublished: boolean) => {
      const response = await fetch(`/api/projects/${props.project.id}`, {
        method: "PATCH",
        headers: {
          "languages-Type": "application/json",
        },
        body: JSON.stringify({
          published: isPublished,
        }),
      })

      if (!response?.ok) {
        return toast({
          title: "Something went wrong.",
          description: "Your project was not saved. Please try again.",
          variant: "destructive",
        })
      }
    },
    [props.project.id]
  )

  const languages: Language[] = useMemo(
    () =>
      i18n.languages.map((language) => ({
        lang: language.lang,
        short: language.short,
      })),
    [i18n.languages]
  )

  const checkIfKeyAlreadyExists = useCallback(
    (key: string): boolean => {
      if (key) {
        return (
          (i18n.info as I18nInfo[]).find((info) => info.key === key) !==
          undefined
        )
      }

      return false
    },
    [i18n.info]
  )

  return {
    title: i18n.title,
    keywords,
    languages,
    settings: i18n.settings,
    editTranslation,
    addNewKey,
    deleteKey,
    save,
    isSaving,
    isPublished: props.project.published,
    setTitle,
    editContext,
    editKey,
    addLanguage,
    editLanguage,
    deleteLanguage,
    editSettings,
    addNewConstantTranslation,
    checkIfKeyAlreadyExists,
    importKeys,
    download,
    publishProject,
  }
}

export default useTranslation
