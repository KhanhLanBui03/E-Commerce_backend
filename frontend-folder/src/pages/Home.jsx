import React from 'react'
import BestSeller from '../components/BestSeller'
import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'
import NewletterBox from '../components/NewletterBox'
import OurPolicy from '../components/OurPolicy'
import ScrollAnimation from '../components/ScrollAnimation'

const Home = () => {
  return (
    <div>
      <ScrollAnimation>
        <Hero />
      </ScrollAnimation>

      <ScrollAnimation delay={0.2}>
        <LatestCollection />
      </ScrollAnimation>

      <ScrollAnimation delay={0.4}>
        <BestSeller />
      </ScrollAnimation>

      <ScrollAnimation delay={0.6}>
        <OurPolicy />
      </ScrollAnimation>

      <ScrollAnimation delay={0.8}>
        <NewletterBox />
      </ScrollAnimation>
    </div>
  )
}

export default Home
