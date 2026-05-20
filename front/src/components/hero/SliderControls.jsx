'use client'

import { useState, useEffect } from 'react'

export default function SliderControls({ 
  cards, 
  currentSlide, 
  onNext, 
  onPrev, 
  onSlideChange,
  onVideoTap,
  isMobile,
  currentVideoRef 
}) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Следим за состоянием видео
  useEffect(() => {
    if (currentVideoRef) {
      const updatePlayingState = () => {
        setIsVideoPlaying(!currentVideoRef.paused)
      }

      currentVideoRef.addEventListener('play', updatePlayingState)
      currentVideoRef.addEventListener('pause', updatePlayingState)
      
      // Инициализируем начальное состояние
      updatePlayingState()

      return () => {
        currentVideoRef.removeEventListener('play', updatePlayingState)
        currentVideoRef.removeEventListener('pause', updatePlayingState)
      }
    }
  }, [currentVideoRef])

  // Обработчик для кнопки play/pause
  const handlePlayPauseClick = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    if (isMobile && onVideoTap && currentVideoRef) {
      onVideoTap(currentSlide)
      
      // Немедленная визуальная обратная связь
      setIsVideoPlaying(!isVideoPlaying)
    }
  }

  return (
    <>
      {/* Кнопка "Назад" - больше breakpoints */}
      <button
        onClick={onPrev}
        className='absolute left-1.5 xs:left-2 sm:left-3 md:left-4 lg:left-6 xl:left-8 top-1/2 transform -translate-y-1/2 z-40 w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 xl:w-12 xl:h-12 bg-white/80 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors backdrop-blur-sm'
        aria-label='Предыдущее видео'>
        <svg
          className='w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 xl:w-6 xl:h-6 text-[#4A382B]'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
        </svg>
      </button>

      {/* Кнопка "Вперед" - больше breakpoints */}
      <button
        onClick={onNext}
        className='absolute right-1.5 xs:right-2 sm:right-3 md:right-4 lg:right-6 xl:right-8 top-1/2 transform -translate-y-1/2 z-40 w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 xl:w-12 xl:h-12 bg-white/80 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors backdrop-blur-sm'
        aria-label='Следующее видео'>
        <svg
          className='w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 xl:w-6 xl:h-6 text-[#4A382B]'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
        </svg>
      </button>

      {/* Кнопка Play/Pause для мобильных - уменьшенные размеры */}
      {isMobile && currentVideoRef && (
        <button
          onClick={handlePlayPauseClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
          className={`
            absolute top-2 right-2 z-40 
            w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10
            bg-opacity-60 backdrop-blur-sm 
            rounded-full flex items-center justify-center 
            shadow-lg transition-all duration-300
            ${isHovered ? 'bg-opacity-80 scale-105' : 'bg-opacity-60 scale-100'}
            hover:bg-opacity-80 hover:scale-105
          `}
          aria-label={isVideoPlaying ? 'Пауза' : 'Воспроизведение'}
        >
          {/* Анимированный переход между иконками */}
          <div className="relative w-5 h-5 xs:w-5.5 xs:h-5.5 sm:w-6 sm:h-6 flex items-center justify-center">
            
            {/* Иконка Play - анимируется при появлении/исчезновении */}
            <svg 
              className={`
                absolute transition-all duration-300 text-white
                ${isVideoPlaying 
                  ? 'opacity-0 scale-50 rotate-90' 
                  : 'opacity-100 scale-100 rotate-0'
                }
                ${isHovered && !isVideoPlaying ? 'scale-110' : 'scale-100'}
              `}
              fill='currentColor' 
              viewBox='0 0 24 24'
            >
              <path d="M8 5v14l11-7z"/>
            </svg>
            
            {/* Иконка Pause - анимируется при появлении/исчезновении */}
            <svg 
              className={`
                absolute transition-all duration-300 text-white
                ${isVideoPlaying 
                  ? 'opacity-100 scale-100 rotate-0' 
                  : 'opacity-0 scale-50 -rotate-90'
                }
                ${isHovered && isVideoPlaying ? 'scale-110' : 'scale-100'}
              `}
              fill='currentColor' 
              viewBox='0 0 24 24'
            >
              <path d="M6 4h4v16H6zm8 0h4v16h-4z"/>
            </svg>
            
          </div>
        </button>
      )}

      {/* Индикаторы прогресса - больше breakpoints */}
      <div className='absolute bottom-1.5 xs:bottom-2 sm:bottom-3 md:bottom-4 lg:bottom-6 xl:bottom-8 left-1/2 transform -translate-x-1/2 z-40 flex space-x-0.5 xs:space-x-1 sm:space-x-1.5 md:space-x-2'>
        {cards.map((_, index) => (
          <button
            key={index}
            onClick={() => onSlideChange(index)}
            className={`rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'w-3 h-1 xs:w-4 xs:h-1.5 sm:w-5 sm:h-1.5 md:w-6 md:h-2 lg:w-7 lg:h-2 xl:w-8 xl:h-2 bg-white'
                : 'w-1 h-1 xs:w-1.5 xs:h-1.5 sm:w-2 sm:h-2 bg-white/60'
            }`}
            aria-label={`Перейти к видео ${index + 1}`}
          />
        ))}
      </div>
    </>
  )
}