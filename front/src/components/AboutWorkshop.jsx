export default function AboutWorkShop() {
  return (
    <section className='py-8 xs:py-10 sm:py-12 md:py-14 lg:py-16 px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8 bg-white'>
      <div className='container mx-auto'>
        <div className='flex flex-col lg:flex-row gap-6 xs:gap-7 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-32 items-start'>
          {/* Левая колонка */}
          <div className='flex-1 w-full'>
            <h2 className='text-xl xs:text-2xl sm:text-2xl md:text-3xl lg:text-[32px] font-molot font-bold leading-6 xs:leading-7 sm:leading-7 md:leading-5 text-black mb-3 xs:mb-4 sm:mb-4 md:mb-5'>
              О мастерской
            </h2>

            <div className='space-y-3 xs:space-y-4 sm:space-y-4 md:space-y-5 lg:space-y-6'>
              <div className='text-sm xs:text-base sm:text-base md:text-lg font-bengaly text-[#4A382B] leading-5 xs:leading-6 sm:leading-6 md:leading-7 text-justify'>
                <p className='mb-2 xs:mb-3 sm:mb-3 md:mb-4'>
                  Меня зовут Степан и уже 6 лет я занимаюсь ручным пошивом изделий из натуральной
                  кожи.
                </p>
                <p>
                  Моя мастерская «КОНТРАСТ» - и мы создаём уникальные и стильные изделия из
                  натуральной Итальянской кожи премиум качества.
                </p>
              </div>
            </div>
          </div>

          {/* Правая колонка - бокс о коже */}
          <div className='flex-1 w-full self-start mt-6 xs:mt-7 sm:mt-8 lg:mt-0'>
            <div className='border-2 xs:border-3 sm:border-3 md:border-4 border-[#C6A884] rounded-lg p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 bg-white'>
              <p className='text-sm xs:text-base sm:text-base md:text-lg font-bengaly text-[#4A382B] leading-5 xs:leading-6 sm:leading-6 md:leading-7 text-center xs:text-center sm:text-left break-words'>
                Кожа — материал с характером. Мы подчёркиваем его, а не скрываем.
              </p>
            </div>

            {/* Информация о доставке - адаптивная */}
            <div className='mt-4 xs:mt-5 sm:mt-6 md:mt-8 lg:mt-12'>
              <p className='text-sm xs:text-base sm:text-base md:text-lg font-bengaly text-[#4A382B] leading-5 xs:leading-6 sm:leading-6 md:leading-7 text-center xs:text-center sm:text-left break-words'>
                Срок изготовления на заказ - от 3 до 7 дней. Доставка по РФ.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
