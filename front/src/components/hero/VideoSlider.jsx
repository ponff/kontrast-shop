'use client'
import { useState, useEffect } from 'react'
import VideoSlide from './VideoSlide'
import SliderControls from './SliderControls'

export default function VideoSlider({ cards, currentSlide, onSlideChange, onVideoRef, onVideoTap, isMobile }) {
  const [isMobileView, setIsMobileView] = useState(false)
  const [currentVideoElement, setCurrentVideoElement] = useState(null)

  const nextSlide = () => onSlideChange((currentSlide + 1) % cards.length)
  const prevSlide = () => onSlideChange((currentSlide - 1 + cards.length) % cards.length)

  // Определяем тип устройства после монтирования
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth <= 1024)
    }

    const handleResize = () => {
      checkMobile()
    }

    checkMobile()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Функция для обновления ref видео
  const handleVideoRef = (el, index) => {
    onVideoRef(el, index)
    // Сохраняем ref текущего активного видео
    if (index === currentSlide) {
      setCurrentVideoElement(el)
    }
  }

  // Обновляем currentVideoElement при смене слайда
  useEffect(() => {
    // Будет обновлено когда VideoSlide вызовет onVideoRef
  }, [currentSlide])

  return (
    <div className='relative lg:absolute top-0 right-0 h-48 xs:h-56 sm:h-64 md:h-72 lg:h-full w-full lg:w-[50%] xl:w-[55%] order-1 lg:order-2 mb-4 xs:mb-5 sm:mb-6 lg:mb-0 flex items-center'>
      <div className='relative h-full w-full flex items-center'>
        <div className='relative w-full h-full'>
          {cards.map((card, index) => {
            const position = (index - currentSlide + cards.length) % cards.length

            let transform = ''
            let zIndex = 0
            let opacity = 1
            let scale = 1

            if (isMobile) {
              if (position === 0) {
                transform = 'translateX(0)'
                zIndex = 30
                opacity = 1
              } else {
                transform = 'translateX(100%)'
                zIndex = 0
                opacity = 0
              }
            } else {
              if (position === 0) {
                transform = 'translateX(0)'
                zIndex = 30
              } else if (position === 1) {
                transform = 'translateX(30px) xs:translateX(35px) sm:translateX(40px) scale(0.95)'
                zIndex = 20
                opacity = 0.7
                scale = 0.95
              } else if (position === 2) {
                transform = 'translateX(60px) xs:translateX(70px) sm:translateX(80px) scale(0.9)'
                zIndex = 10
                opacity = 0.4
                scale = 0.9
              } else {
                transform = 'translateX(80px) xs:translateX(90px) sm:translateX(100px) scale(0.8)'
                zIndex = 0
                opacity = 0
                scale = 0.8
              }
            }

            return (
              <div
                key={card.id}
                className='absolute top-0 left-0 w-full h-full transition-all duration-500 ease-in-out'
                style={{
                  transform,
                  zIndex,
                  opacity,
                  scale,
                }}>
                <VideoSlide
                  card={card}
                  index={index}
                  isActive={index === currentSlide}
                  onVideoRef={handleVideoRef}
                  onVideoTap={onVideoTap}
                  isMobile={isMobile}
                />
              </div>
            )
          })}
        </div>

        <SliderControls
          cards={cards}
          currentSlide={currentSlide}
          onNext={nextSlide}
          onPrev={prevSlide}
          onSlideChange={onSlideChange}
          onVideoTap={onVideoTap}
          isMobile={isMobile}
          currentVideoRef={currentVideoElement}
        />
      </div>
    </div>
  )
}