import React from 'react'
import Footer from '~/components/Footer'
import FAQ from '~/components/LandingPage/FAQ'
import QuizPreview from '~/components/LandingPage/QuizPreview'
import NavBar from '~/components/NavBar'
import SelectSection from '~/components/Select-Quiz/SelectSection'

const QuizSelect = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
        <NavBar dark={false} />
        <SelectSection />
        <QuizPreview className='bg-primary-25 my-30' />
        <FAQ />
        <Footer />
    </div>
  )
}

export default QuizSelect