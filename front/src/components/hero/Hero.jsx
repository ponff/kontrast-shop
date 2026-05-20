'use client'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import HeroContent from './HeroContent'
import VideoSlider from './VideoSlider'

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const videoRefs = useRef([])

  const cards = useMemo(
    () => [
      {
        id: 1,
        video: '/videos/1.mp4',
        title: 'Кройка кожи - процесс вырезания кожи по лекалам специальными ножами',
      },
      {
        id: 2,
        video: '/videos/2.mp4',
        title: 'Брусовка кожи, подгонка лоскутков под идеальные форму и размер изделия',
      },
      {
        id: 3,
        video: '/videos/3.mp4',
        title: 'Один из итоговых штрихов создания изделия - прошивка кожи',
      },
    ],
    []
  )

  // Определяем тип устройства
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSlideChange = useCallback(
    newIndex => {
      // Пауза текущего видео
      if (videoRefs.current[currentSlide]) {
        videoRefs.current[currentSlide].pause()
      }
      
      setCurrentSlide(newIndex)
      
      // На десктопе автоплей следующего видео
      if (!isMobile && videoRefs.current[newIndex]) {
        setTimeout(() => {
          videoRefs.current[newIndex].play().catch(console.error)
        }, 300)
      }
    },
    [currentSlide, isMobile]
  )

  // Автоплей только на десктопе
  useEffect(() => {
    if (isMobile) return

    const interval = setInterval(() => {
      handleSlideChange((currentSlide + 1) % cards.length)
    }, 11000)
    return () => clearInterval(interval)
  }, [currentSlide, handleSlideChange, cards.length, isMobile])

  // Инициализация первого видео на десктопе
  useEffect(() => {
    if (!isMobile && videoRefs.current[0]) {
      videoRefs.current[0].play().catch(console.error)
    }
  }, [isMobile])

  // Функция для воспроизведения видео по тапу (ТОЛЬКО ДЛЯ МОБИЛЬНЫХ)
  const handleVideoTap = useCallback((index) => {
    if (!isMobile) return
    
    const video = videoRefs.current[index];
    if (video) {
      
      if (video.paused) {
        video.play().catch(() => {
        // Тихая обработка ошибки воспроизведения
      });
      } else {
        video.pause();
      
      }
    }
  }, [isMobile]);

  const handleVideoRef = (el, index) => {
    videoRefs.current[index] = el
    if (el) {
      el.playsInline = true
      el.muted = true
      el.loop = true
      // Разная стратегия загрузки для мобильных и десктопа
      if (isMobile) {
        el.preload = 'metadata'
      } else {
        el.preload = index === currentSlide ? 'auto' : 'metadata'
      }
    }
  }

  return (
    <>
      <section className='relative w-full h-[50vh] xs:h-[55vh] sm:h-[60vh] md:h-[65vh] lg:h-[70vh] xl:h-[80vh] 2xl:h-[85vh] min-h-[350px] xs:min-h-[400px] sm:min-h-[450px] md:min-h-[500px] lg:min-h-[550px] xl:min-h-[650px] 2xl:min-h-[850px] bg-white overflow-hidden'>
        <div
          className='absolute inset-0 opacity-30 xs:opacity-35 sm:opacity-40'
          style={{
            background: `
              radial-gradient(70.71% 70.71% at 50% 50%, #28201b 0%, rgba(130, 57, 57, 0.87) 32.34%, rgba(0, 0, 0, 0.00) 57.5%),
              radial-gradient(70.71% 70.71% at 50% 50%, #EEE3D3 0%, rgba(0, 0, 0, 0.00) 12.18%)
            `,
          }}
        />

        <div className='container mx-auto px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8 h-full relative z-10'>
          <div className='flex flex-col lg:flex-row h-full items-center lg:items-stretch'>
            <HeroContent />
            <VideoSlider
              cards={cards}
              currentSlide={currentSlide}
              onSlideChange={handleSlideChange}
              onVideoRef={handleVideoRef}
              onVideoTap={isMobile ? handleVideoTap : undefined} // Только для мобильных
              isMobile={isMobile}
            />
          </div>
        </div>
      </section>
    </>
  )
}