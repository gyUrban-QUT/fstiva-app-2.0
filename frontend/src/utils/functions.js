  // convert ticket price to numeric to allow for multiplication
  function numericPrice(stringPrice) {
      if (typeof stringPrice === 'number') return stringPrice;
      const numericString = stringPrice.replace(/[^0-9.-]/g, '');
      return parseFloat(numericString) || 0; 
  };

  export default numericPrice;