"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { loadRemoteModule } from "@/lib/load-remote-module"

interface RemoteComponentLoaderProps {
  remoteUrl: string
  scope: string
  module: string
  fallback?: React.ReactNode
  errorFallback?: React.ReactNode
}

export function RemoteComponentLoader({
  remoteUrl,
  scope,
  module,
  fallback,
  errorFallback,
}: RemoteComponentLoaderProps) {
  const [Component, setComponent] = useState<React.ComponentType | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRemoteModule({
      remoteUrl,
      scope,
      module,
    })
      .then((mod) => {
        setComponent(() => mod.default || mod)
        setLoading(false)
      })
      .catch((err) => {
        console.error("[v0] Failed to load remote module:", err)
        setError(err)
        setLoading(false)
      })
  }, [remoteUrl, scope, module])

  if (loading) {
    return (
      fallback || (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    )
  }

  if (error) {
    return (
      errorFallback || (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">Ошибка загрузки модуля: {error.message}</p>
        </div>
      )
    )
  }

  if (!Component) {
    return null
  }

  return <Component />
}
