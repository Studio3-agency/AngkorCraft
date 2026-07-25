import React, { createContext, useContext, useState, useEffect } from 'react';

interface CurrencyContextType {
  rate: number;
  loading: boolean;
  updatedAt: string;
}

const FALLBACK_RATE = 4100;

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rate, setRate] = useState<number>(FALLBACK_RATE);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string>('');

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then((r) => r.json())
      .then((data) => {
        if (data?.rates?.KHR) {
          setRate(data.rates.KHR);
          const d = data.time_last_update_unix ? new Date(data.time_last_update_unix * 1000) : new Date();
          setUpdatedAt(d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }));
        }
      })
      .catch((err) => {
        console.error('Failed to fetch exchange rate:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <CurrencyContext.Provider value={{ rate, loading, updatedAt }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
