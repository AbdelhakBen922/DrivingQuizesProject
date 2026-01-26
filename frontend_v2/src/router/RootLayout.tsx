import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { AuthProvider } from '../contexts/AuthContext'

export default function RootLayout() {
  const { i18n } = useTranslation()
  const [currentLang, setCurrentLang] = useState(i18n.language)

  useEffect(() => {
    setCurrentLang(i18n.language)
  }, [i18n.language])

  useEffect(() => {
    const handleLanguageChange = (lng: string) => setCurrentLang(lng)
    i18n.on('languageChanged', handleLanguageChange)
    return () => i18n.off('languageChanged', handleLanguageChange)
  }, [i18n])

  const dir = currentLang === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    document.documentElement.lang = currentLang
    document.documentElement.dir = dir
  }, [currentLang, dir])

  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}
