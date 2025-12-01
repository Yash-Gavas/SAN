import { useState, useEffect, useCallback } from 'react';
import { priceOracle, PriceFeed } from '@/lib/priceOracle';

export interface UsePriceFeedOptions {
  refreshInterval?: number;
  enableAutoRefresh?: boolean;
}

export function usePriceFeed(symbol: string, options: UsePriceFeedOptions = {}) {
  const [price, setPrice] = useState<PriceFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const {
    refreshInterval = 30000,
    enableAutoRefresh = true
  } = options;

  const fetchPrice = useCallback(async () => {
    if (!symbol) return;

    try {
      setLoading(true);
      setError(null);
      
      const priceData = await priceOracle.getPrice(symbol);
      
      if (priceData) {
        setPrice(priceData);
        setLastUpdated(new Date(priceData.timestamp));
      } else {
        setError(`Unable to fetch price for ${symbol}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch price');
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!symbol || !enableAutoRefresh) return;

    const unsubscribe = priceOracle.subscribe(symbol, (priceData) => {
      setPrice(priceData);
      setLastUpdated(new Date(priceData.timestamp));
      setLoading(false);
      setError(null);
    });

    // Initial fetch
    fetchPrice();

    return unsubscribe;
  }, [symbol, enableAutoRefresh, fetchPrice]);

  // Manual refresh interval
  useEffect(() => {
    if (!enableAutoRefresh || !refreshInterval) return;

    const interval = setInterval(fetchPrice, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchPrice, refreshInterval, enableAutoRefresh]);

  return {
    price,
    loading,
    error,
    lastUpdated,
    refresh: fetchPrice,
    isStale: lastUpdated ? Date.now() - lastUpdated.getTime() > 60000 : true
  };
}

export function useMultiplePriceFeeds(symbols: string[], options: UsePriceFeedOptions = {}) {
  const [prices, setPrices] = useState<Map<string, PriceFeed>>(new Map());
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Map<string, string>>(new Map());

  const {
    refreshInterval = 30000,
    enableAutoRefresh = true
  } = options;

  const fetchAllPrices = useCallback(async () => {
    if (symbols.length === 0) return;

    setLoading(true);
    const newPrices = new Map<string, PriceFeed>();
    const newErrors = new Map<string, string>();

    await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const priceData = await priceOracle.getPrice(symbol);
          if (priceData) {
            newPrices.set(symbol, priceData);
          } else {
            newErrors.set(symbol, `Unable to fetch price for ${symbol}`);
          }
        } catch (err) {
          newErrors.set(symbol, err instanceof Error ? err.message : 'Failed to fetch price');
        }
      })
    );

    setPrices(newPrices);
    setErrors(newErrors);
    setLoading(false);
  }, [symbols]);

  // Subscribe to real-time updates for all symbols
  useEffect(() => {
    if (!enableAutoRefresh || symbols.length === 0) return;

    const unsubscribes = symbols.map(symbol => 
      priceOracle.subscribe(symbol, (priceData) => {
        setPrices(prev => new Map(prev).set(symbol, priceData));
        setErrors(prev => {
          const newErrors = new Map(prev);
          newErrors.delete(symbol);
          return newErrors;
        });
      })
    );

    // Initial fetch
    fetchAllPrices();

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [symbols, enableAutoRefresh, fetchAllPrices]);

  return {
    prices,
    loading,
    errors,
    refresh: fetchAllPrices,
    getPrice: (symbol: string) => prices.get(symbol) || null,
    getError: (symbol: string) => errors.get(symbol) || null
  };
}