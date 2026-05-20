'use client'
import { CustomForm } from '../forms/CustomForm'

export default function HeroContent({ onCustomOrderClick }) {
  return (
    <div className='flex-1 w-full lg:max-w-2xl lg:pr-8 xl:pr-12 order-2 lg:order-1 text-center lg:text-left flex flex-col justify-center lg:justify-center'>
      <div className='lg:mt-0'>
        <h2 className='text-xl xs:text-2xl sm:text-2xl md:text-3xl lg:text-[36px] xl:text-[44px] font-bengaly font-normal leading-[1.1] xs:leading-[1.2] sm:leading-[1.2] md:leading-[1.3] lg:leading-[1.3] xl:leading-[48px] tracking-[-0.3px] xs:tracking-[-0.5px] sm:tracking-[-0.7px] md:tracking-[-0.9px] lg:tracking-[-1px] xl:tracking-[-1.2px] text-black mb-3 xs:mb-4 sm:mb-4 md:mb-5 lg:mb-6'>
          Изделия из натуральной кожи
        </h2>

        <div className='mb-4 xs:mb-5 sm:mb-5 md:mb-6 lg:mb-7 xl:mb-8 space-y-1.5 xs:space-y-2 sm:space-y-2.5 md:space-y-3 text-[#4A382B]'>
          <p className='text-sm xs:text-base sm:text-base md:text-lg font-bengaly text-[#4A382B] leading-[1.3] xs:leading-[1.4] sm:leading-[1.4] md:leading-5 lg:leading-6'>
            Аксессуары ручной работы из премиальной кожи: ремни, кошельки,
          </p>
          <p className='text-sm xs:text-base sm:text-base md:text-lg font-bengaly text-[#4A382B] leading-[1.3] xs:leading-[1.4] sm:leading-[1.4] md:leading-5 lg:leading-6'>
            обложки и сумки. Без лишнего - только форма и фактура.
          </p>
          <p className='text-sm xs:text-base sm:text-base md:text-lg font-bengaly text-[#4A382B] leading-[1.3] xs:leading-[1.4] sm:leading-[1.4] md:leading-5 lg:leading-6'>
            пожалуйста, ничего не заказывайте, это дипломный проект, и я не могу выполнять заказы.
          </p>
        </div>

        <div className='flex flex-col xs:flex-col sm:flex-row justify-center lg:justify-start gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3'>
          <a href='#catalog' className='flex-1 sm:flex-none'>
            <button className='w-full sm:w-auto px-4 xs:px-5 sm:px-6 md:px-7 lg:px-8 py-2 xs:py-2.5 sm:py-2.5 md:py-3 bg-[#4A382B] text-white text-xs xs:text-sm sm:text-sm font-normal rounded-md hover:bg-[#4A382B]/90 transition-colors border border-[#C6A884]'>
              Смотреть каталог
            </button>
          </a>
          <div className='flex-1 sm:flex-none'>
            <CustomForm
              trigger={
                <button className='w-full sm:w-auto px-4 xs:px-5 sm:px-6 py-2 xs:py-2.5 sm:py-2.5 border border-[#C6A884] bg-white text-black text-xs xs:text-sm sm:text-sm font-normal rounded-md hover:bg-[#C6A884] transition-colors'>
                  Индивидуальный заказ
                </button>
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
