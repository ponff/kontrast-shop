// src/components/forms/LeatherColorSelect.jsx
import { useState } from 'react'

const leatherColors = [
  { id: 'brown', name: 'Коричневый', value: '#8B4513' },
  { id: 'black', name: 'Черный', value: '#000000' },
  { id: 'cognac', name: 'Коньячный', value: '#994C00' },
  { id: 'tan', name: 'Бежевый', value: '#D2B48C' },
]

export function LeatherColorSelect({ value, onChange, required = false }) {
  const [selectedColor, setSelectedColor] = useState(value || '')

  const handleChange = e => {
    const newValue = e.target.value
    setSelectedColor(newValue)
    onChange(newValue)
  }

  return (
    <div className='space-y-2'>
      <select
        id='leatherColor'
        name='leatherColor'
        required={required}
        value={selectedColor}
        onChange={handleChange}
        className='w-full px-3 py-2 bg-white border-2 border-[#C6A884] rounded-md focus:border-[#4A382B] focus:outline-none text-black'>
        <option value=''>Выберите цвет</option>
        {leatherColors.map(color => (
          <option key={color.id} value={color.id}>
            {color.name}
          </option>
        ))}
      </select>

      {/* Визуальное отображение выбранного цвета */}
      {selectedColor && (
        <div className='flex items-center gap-2 mt-2'>
          <div
            className='w-6 h-6 rounded-full border border-gray-300'
            style={{
              backgroundColor: leatherColors.find(c => c.id === selectedColor)?.value,
            }}
          />
          <span className='text-sm text-black font-bengaly'>
            {leatherColors.find(c => c.id === selectedColor)?.name}
          </span>
        </div>
      )}
    </div>
  )
}
