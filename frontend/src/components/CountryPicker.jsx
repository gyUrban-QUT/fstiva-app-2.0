import React, { useMemo } from 'react';
import { countries } from 'countries-list';

function CountryPicker({ value, onChange }) {
  // Format and sort the data locally without any API calls
  const countryOptions = useMemo(() => {
    return Object.entries(countries)
      .map(([code, data]) => ({
        code, // e.g. "US", "AU"
        name: data.name,
        emoji: data.emoji // Built-in flag emoji
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  return (
    <div className="relative">
      <select 
        name="country" 
        value={value} 
        onChange={onChange}
        required
        className="w-full mb-4 p-2 border rounded"
      >
        <option value="">Select a country</option>
        {countryOptions.map((country) => (
          <option key={country.code} value={country.code} className="text-slate-900">
            {country.emoji} {country.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default CountryPicker;
