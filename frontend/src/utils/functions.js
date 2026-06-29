  // convert ticket price to numeric to allow for multiplication
  export function numericPrice(stringPrice) {
      if (typeof stringPrice === 'number') return stringPrice;
      const numericString = stringPrice.replace(/[^0-9.-]/g, '');
      return parseFloat(numericString) || 0; 
  };

  export function formatDisplayRange(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) return '';
  
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  const dayFmt = new Intl.DateTimeFormat('en', { day: '2-digit' });
  const monthFmt = new Intl.DateTimeFormat('en', { month: 'long' });
  const yearFmt = new Intl.DateTimeFormat('en', { year: 'numeric' });

  if (start.getFullYear() !== end.getFullYear()) {
    return `${dayFmt.format(start)} ${monthFmt.format(start)} ${yearFmt.format(start)} - ${dayFmt.format(end)} ${monthFmt.format(end)} ${yearFmt.format(end)}`;
  }
  if (start.getMonth() !== end.getMonth()) {
    return `${dayFmt.format(start)} ${monthFmt.format(start)} - ${dayFmt.format(end)} ${monthFmt.format(end)}, ${yearFmt.format(start)}`;
  }
  return `${dayFmt.format(start)} - ${dayFmt.format(end)} ${monthFmt.format(start)}, ${yearFmt.format(start)}`;
};

const fx = {
  numericPrice,
  formatDisplayRange
};

export default fx;