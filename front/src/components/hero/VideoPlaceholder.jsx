export default function VideoPlaceholder({ card, isActive }) {
    return (
        <div className="w-full h-full bg-gradient-to-br flex items-center justify-center relative overflow-hidden group">
            {/* Пульсирующие круги*/}
            <div className="absolute inset-0 flex items-center justify-center">
                <div 
                    className="border border-stone-300 rounded-full opacity-60"
                    style={{
                        width: 'clamp(80px, 20vw, 128px)',
                        height: 'clamp(80px, 20vw, 128px)',
                        animation: 'pulse 3s ease-in-out infinite',
                        borderWidth: 'clamp(1px, 0.3vw, 3px)'
                    }}
                ></div>
                <div 
                    className="absolute border border-stone-400 rounded-full opacity-40"
                    style={{
                        width: 'clamp(60px, 15vw, 96px)',
                        height: 'clamp(60px, 15vw, 96px)',
                        animation: 'pulse 3s ease-in-out infinite 0.5s',
                        borderWidth: 'clamp(1px, 0.3vw, 3px)'
                    }}
                ></div>
            </div>

            {/* Основной контент */}
            <div className="relative z-10 text-center transform group-hover:scale-105 transition-transform duration-500 px-4">
                {/* Текст с анимацией появления */}
                <div className="space-y-2 md:space-y-3 lg:space-y-4">
                    <div 
                        className="text-stone-700 font-light font-molot tracking-widest uppercase text-lg md:text-2xl lg:text-3xl"
                        style={{
                            animation: 'fadeInUp 0.8s ease-out forwards'
                        }}
                    >
                        КОНТРАСТ
                    </div>
                </div>
            </div>

            {/* Анимированные точки в углу */}
            <div className="absolute bottom-4 sm:bottom-28 flex space-x-1.5">
                {[0, 1, 2].map((item) => (
                    <div 
                        key={item}
                        className="rounded-full bg-stone-500"
                        style={{
                            width: 'clamp(0.25rem, 1.5vw, 1rem)',
                            height: 'clamp(0.25rem, 1.5vw, 1rem)',
                            animation: `bounce 1.2s infinite ${item * 0.15}s`
                        }}
                    />
                ))}
            </div>

            {/* Эффект блика при hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 group-hover:translate-x-full transition-all duration-1000"></div>
          

            {/* Inline styles для анимаций */}
            <style jsx>{`
                @keyframes textureShift {
                    0% { background-position: 0% 0%; }
                    100% { background-position: 100% 100%; }
                }
                
                @keyframes pulse {
                    0%, 100% { 
                        transform: scale(0.8); 
                        opacity: 0.6; 
                    }
                    50% { 
                        transform: scale(1.1); 
                        opacity: 0.3; 
                    }
                }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes bounce {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-4px);
                    }
                }

                /* Медиа-запросы для тонкой настройки */
                @media (max-width: 640px) {
                    .text-stone-700 {
                        letter-spacing: 0.1em;
                    }
                }

                @media (min-width: 641px) and (max-width: 1024px) {
                    .text-stone-700 {
                        letter-spacing: 0.15em;
                    }
                }

                @media (min-width: 1025px) {
                    .text-stone-700 {
                        letter-spacing: 0.2em;
                    }
                }
            `}</style>
        </div>
    )
}