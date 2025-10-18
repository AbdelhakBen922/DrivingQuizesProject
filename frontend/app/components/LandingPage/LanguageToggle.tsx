import { useState } from 'react'

export default function LanguageToggle() {
  const [lang, setLang] = useState('FR')

  return (
    <div
      onClick={() => setLang(lang === 'AR' ? 'FR' : 'AR')}
      className="relative flex w-24 cursor-pointer select-none items-center justify-between 
                 rounded-full border border-white px-2 py-1 text-sm text-white bg-transparent"
    >
      <span className={`${lang === 'AR' ? 'font-bold' : 'text-white'}`}>AR</span>
      <span className={`${lang === 'FR' ? 'font-bold' : 'text-white'}`}>FR</span>

      <div
        className={`absolute top-0 left-0 h-full w-1/2 rounded-full bg-white  transition-all duration-300 
                    ${lang === 'FR' ? 'translate-x-full' : 'translate-x-0'}`}
      ></div>
    </div>
  )
}
