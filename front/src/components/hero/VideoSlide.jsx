import { useState, useEffect, useRef } from "react";
import VideoPlaceholder from "./VideoPlaceholder";

export default function VideoSlide({ card, index, isActive, onVideoRef, onVideoTap, isMobile }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef(null);

  // Передаем ref в родительский компонент
  useEffect(() => {
    if (videoRef.current) {
      onVideoRef(videoRef.current, index);
    }
  }, [onVideoRef, index]);

  useEffect(() => {
    if (isActive) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [isActive]);

  const handleLoadStart = () => {
    setIsLoading(true);
  };

  const handleLoadedData = () => {
    setIsLoading(false);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  const handleError = (e) => {
    setHasError(true);
    setIsLoading(false);
  };

  // Обработчик тапа по видео (только для мобильных)
  const handleVideoClick = (e) => {
    if (!isMobile || !onVideoTap) return;
    
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (isActive && videoRef.current) {
      onVideoTap(index);
    }
  };

  // Таймаут для закешированных видео
  useEffect(() => {
    if (isActive && isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isActive, isLoading, index]);

  return (
    <div
      className={`absolute inset-0 transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
      
      {isLoading && isActive && <VideoPlaceholder card={card} isActive={isActive} />}
      
      {!hasError ? (
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${isLoading ? 'hidden' : 'block'}`}
            playsInline
            muted
            loop
            preload={isActive ? "auto" : "metadata"}
            onLoadStart={handleLoadStart}
            onLoadedData={handleLoadedData}
            onCanPlay={handleCanPlay}
            onError={handleError}
            onClick={isMobile ? handleVideoClick : undefined}
            disablePictureInPicture
            disableRemotePlayback>
            <source src={card.video} type='video/mp4' />
            Ваш браузер не поддерживает видео.
          </video>
        </div>
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <div className="text-gray-500">Ошибка загрузки видео</div>
        </div>
      )}

      <div
        className='absolute inset-0'
        style={{
          background: 'rgba(96, 58, 58, 0.00)',
          boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.08) inset',
        }}
      />
    </div>
  );
}