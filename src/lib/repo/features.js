export const useFeatures = () => {
  const envTender  = (import.meta.env.VITE_FEATURE_TENDER  || 'off') === 'on';
  const envFinance = (import.meta.env.VITE_FEATURE_FINANCE || 'off') === 'on';

  const params = new URLSearchParams(window.location.search);
  const read = (key, def) => {
    const v = params.get(key) ?? localStorage.getItem(`feature:${key}`);
    if (v == null) return def;
    return ['on','1','true','yes'].includes(String(v).toLowerCase());
  };

  const tender  = read('tender',  envTender);
  const finance = read('finance', envFinance);

  return { tender, finance };
};
