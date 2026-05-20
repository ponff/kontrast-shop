// src/components/forms/FormActions.jsx
import * as Dialog from '@radix-ui/react-dialog'

export function FormActions({ isSubmitting, onCancel, submitText = 'Отправить' }) {
  return (
    <div className='flex flex-col-reverse xs:flex-col-reverse sm:flex-row justify-end gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3 pt-3 xs:pt-3.5 sm:pt-4'>
      <Dialog.Close asChild>
        <button
          type='button'
          className='px-3 xs:px-3.5 sm:px-3.5 md:px-4 py-1.5 xs:py-2 sm:py-2 border border-[#C6A884] bg-white text-black rounded-md hover:bg-[#C6A884] transition-colors font-bengaly text-xs xs:text-sm sm:text-sm md:text-base'>
          Отмена
        </button>
      </Dialog.Close>
      <button
        type='submit'
        disabled={isSubmitting}
        className='px-3 xs:px-3.5 sm:px-3.5 md:px-4 py-1.5 xs:py-2 sm:py-2 bg-[#4A382B] text-white rounded-md hover:bg-[#4A382B]/90 transition-colors disabled:opacity-50 font-bengaly text-xs xs:text-sm sm:text-sm md:text-base'>
        {isSubmitting ? 'Отправка...' : submitText}
      </button>
    </div>
  )
}
