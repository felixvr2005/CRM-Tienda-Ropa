/**
 * Live Search - Búsqueda instantánea con debounce
 * Busca productos mientras escribes sin saturar BD
 */
import { useState, useRef, useEffect } from 'react';

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  discount_percentage: number;
  image_url?: string;
}

export default function LiveSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Debounce para no saturar la BD
  useEffect(() => {
    // Limpiar timer anterior
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Si está vacío, no buscar
    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);

    // Esperar 300ms antes de buscar
    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search/products?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data.results || []);
        setShowResults(true);
      } catch (error) {
        console.error('Error searching:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // Debounce 300ms

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  // Cerrar resultados al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-live-search]')) {
        setShowResults(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="relative" data-live-search>
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Buscar productos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setShowResults(true)}
          className="w-full pl-10 pr-4 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 text-sm"
        />
        {isLoading && (
          <svg
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-600 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
      </div>

      {/* Dropdown de resultados */}
      {showResults && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-primary-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <div className="divide-y divide-primary-100">
              {results.map((result) => {
                const price = result.price / 100;
                const discountedPrice = price * (1 - result.discount_percentage / 100);

                return (
                  <a
                    key={result.id}
                    href={`/productos/${result.slug}`}
                    className="flex items-center gap-3 p-3 hover:bg-primary-50 transition-colors"
                  >
                    {result.image_url && (
                      <img
                        src={result.image_url}
                        alt={result.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary-900 truncate">
                        {result.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-primary-600">
                          €{discountedPrice.toFixed(2)}
                        </span>
                        {result.discount_percentage > 0 && (
                          <>
                            <span className="text-xs text-primary-400 line-through">
                              €{price.toFixed(2)}
                            </span>
                            <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                              -{result.discount_percentage}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-primary-500">
              <p>No encontramos "{query}"</p>
              <p className="text-xs text-primary-400 mt-1">
                Prueba con otros términos
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
