export const currencyBR = (v?: number|null) => typeof v==='number'? v.toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:2}):'-';
export const percentBR = (v?: number|null) => (typeof v==='number'? (v*100): null);
export const percentText = (v?: number|null) => v==null? '-' : `${v.toFixed(2)}%`;
