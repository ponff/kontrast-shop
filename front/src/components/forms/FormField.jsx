// src/components/forms/FormField.jsx
import { Label } from '@radix-ui/react-label'

export function FormField({
  id,
  label,
  type = 'text',
  required = false,
  placeholder = '',
  defaultValue = '',
  ...props
}) {
  return (
    <div className='space-y-1.5 xs:space-y-2 sm:space-y-2'>
      <Label
        htmlFor={id}
        className='text-black font-bengaly text-xs xs:text-sm sm:text-sm md:text-base'>
        {label} {required && <span className='text-red-500'>*</span>}
      </Label>
      {type === 'textarea' ? (
        <textarea
          id={id}
          name={id}
          required={required}
          rows={3}
          className='w-full px-2.5 xs:px-3 sm:px-3 py-1.5 xs:py-2 sm:py-2 bg-white border-2 border-[#C6A884] rounded-md focus:border-[#4A382B] focus:outline-none resize-vertical text-black text-xs xs:text-sm sm:text-sm md:text-base placeholder-gray-500'
          placeholder={placeholder}
          defaultValue={defaultValue}
          {...props}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          required={required}
          className='w-full px-2.5 xs:px-3 sm:px-3 py-1.5 xs:py-2 sm:py-2 bg-white border-2 border-[#C6A884] rounded-md focus:border-[#4A382B] focus:outline-none text-black text-xs xs:text-sm sm:text-sm md:text-base placeholder-gray-500'
          placeholder={placeholder}
          defaultValue={defaultValue}
          {...props}
        />
      )}
    </div>
  )
}
