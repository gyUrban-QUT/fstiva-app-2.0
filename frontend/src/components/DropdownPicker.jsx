import React from 'react';
import {daySort, timeSort} from '../utils/dropdownOptions';

export function DayPicker({ value, onChange }) {
  // Format and sort the data locally without any API calls
  const dayOptions = daySort;

  return (
    <div className="relative">
      <select 
        name="day" 
        value={value} 
        onChange={onChange}
        required
        className="w-full mb-4 p-2 border rounded"
      >
        {dayOptions.map((day) => (
          <option key={day.text} value={day.value} className="text-slate-900">
          {day.text}
        </option>
        ))}
      </select>
    </div>
  );
}

export function TimePicker({ value, onChange }) {
  // Format and sort the data locally without any API calls
  const timeOptions = timeSort;

  return (
    <div className="relative">
      <select 
        name="day" 
        value={value} 
        onChange={onChange}
        required
        className="w-full mb-4 p-2 border rounded"
      >
        {timeOptions.map((time) => (
          <option key={time.text} value={time.value} className="text-slate-900">
          {time.text}
        </option>
        ))}
      </select>
    </div>
  );
};
