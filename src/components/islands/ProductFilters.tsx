/**
 * ProductFilters - Filtros de productos React
 * Filtros interactivos para la página de productos
 */
import { useState, useEffect } from 'react';

interface FiltersProps {
  availableFilters: {
    colors: string[];
    sizes: string[];
    priceRange: { min: number; max: number };
  };
  currentFilters: {
    colors: string[];
    sizes: string[];
    minPrice?: number;
    maxPrice?: number;
    onSale: boolean;
    sortBy: string;
  };
  onFilterChange: (filters: any) => void;
  productCount: number;
}

// Mapeo de colores a códigos hex aproximados
const colorMap: Record<string, string> = {
  'Negro': '#000000',
  'Blanco': '#FFFFFF',
  'Beige': '#F5F5DC',
  'Burdeos': '#800020',
  'Azul Marino': '#1E3A5F',
  'Celeste': '#B0E0E6',
  'Rosa': '#FFB6C1',
  'Crema': '#FFFDD0',
  'Camel': '#C19A6B',
  'Marrón': '#8B4513',
  'Gris': '#808080',
  'Azul': '#1E3A5F',
};

export default function ProductFilters({ 
  availableFilters, 
  currentFilters, 
  onFilterChange,
  productCount 
}: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(currentFilters);
  const [priceRange, setPriceRange] = useState({
    min: currentFilters.minPrice || availableFilters.priceRange.min,
    max: currentFilters.maxPrice || availableFilters.priceRange.max
  });

  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  const handleColorToggle = (color: string) => {
    const newColors = localFilters.colors.includes(color)
      ? localFilters.colors.filter(c => c !== color)
      : [...localFilters.colors, color];
    
    const newFilters = { ...localFilters, colors: newColors };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSizeToggle = (size: string) => {
    const newSizes = localFilters.sizes.includes(size)
      ? localFilters.sizes.filter(s => s !== size)
      : [...localFilters.sizes, size];
    
    const newFilters = { ...localFilters, sizes: newSizes };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceChange = () => {
    const newFilters = { 
      ...localFilters, 
      minPrice: priceRange.min,
      maxPrice: priceRange.max 
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (sortBy: string) => {
    const newFilters = { ...localFilters, sortBy };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSaleToggle = () => {
    const newFilters = { ...localFilters, onSale: !localFilters.onSale };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      colors: [],
      sizes: [],
      minPrice: undefined,
      maxPrice: undefined,
      onSale: false,
      sortBy: 'newest'
    };
    setLocalFilters(clearedFilters);
    setPriceRange({
      min: availableFilters.priceRange.min,
      max: availableFilters.priceRange.max
    });
    onFilterChange(clearedFilters);
  };

  const activeFilterCount = 
    localFilters.colors.length + 
    localFilters.sizes.length + 
    (localFilters.onSale ? 1 : 0) +
    (localFilters.minPrice || localFilters.maxPrice ? 1 : 0);

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 border border-primary-300 text-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtros
          {activeFilterCount > 0 && (
            <span className="bg-primary-900 text-white text-xs px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Filter Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-primary-200 p-4 flex items-center justify-between">
              <h2 className="font-medium">Filtros</h2>
              <button onClick={() => setIsOpen(false)} className="p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <FilterContent
                availableFilters={availableFilters}
                localFilters={localFilters}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                handleColorToggle={handleColorToggle}
                handleSizeToggle={handleSizeToggle}
                handlePriceChange={handlePriceChange}
                handleSaleToggle={handleSaleToggle}
                handleSortChange={handleSortChange}
                clearFilters={clearFilters}
                productCount={productCount}
              />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <FilterContent
          availableFilters={availableFilters}
          localFilters={localFilters}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          handleColorToggle={handleColorToggle}
          handleSizeToggle={handleSizeToggle}
          handlePriceChange={handlePriceChange}
          handleSaleToggle={handleSaleToggle}
          handleSortChange={handleSortChange}
          clearFilters={clearFilters}
          productCount={productCount}
        />
      </div>
    </>
  );
}

function FilterContent({
  availableFilters,
  localFilters,
  priceRange,
  setPriceRange,
  handleColorToggle,
  handleSizeToggle,
  handlePriceChange,
  handleSaleToggle,
  handleSortChange,
  clearFilters,
  productCount
}: any) {
  return (
    <div className="space-y-6">
      {/* Ordenar por */}
      <div>
        <h3 className="text-xs uppercase tracking-wider text-primary-500 mb-3">Ordenar por</h3>
        <select
          value={localFilters.sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full border border-primary-300 px-3 py-2 text-sm focus:outline-none focus:border-primary-900"
        >
          <option value="newest">Más recientes</option>
          <option value="price-asc">Precio: menor a mayor</option>
          <option value="price-desc">Precio: mayor a menor</option>
          <option value="popular">Más populares</option>
        </select>
      </div>

      {/* En oferta */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={localFilters.onSale}
            onChange={handleSaleToggle}
            className="w-5 h-5 accent-primary-900"
          />
          <span className="text-sm">Solo productos en oferta</span>
        </label>
      </div>

      {/* Colores */}
      {availableFilters.colors.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-primary-500 mb-3">Color</h3>
          <div className="flex flex-wrap gap-2">
            {availableFilters.colors.map((color: string) => (
              <button
                key={color}
                onClick={() => handleColorToggle(color)}
                className={`group flex items-center gap-2 px-3 py-1.5 border text-sm transition-colors ${
                  localFilters.colors.includes(color)
                    ? 'border-primary-900 bg-primary-900 text-white'
                    : 'border-primary-300 hover:border-primary-500'
                }`}
                title={color}
              >
                <span
                  className="w-4 h-4 rounded-full border border-primary-300"
                  style={{ backgroundColor: colorMap[color] || '#ccc' }}
                />
                <span className="hidden sm:inline">{color}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tallas */}
      {availableFilters.sizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-wider text-primary-500 mb-3">Talla</h3>
            {availableFilters.sizeType === 'shoe' && (
              <small className="text-xs text-primary-400">Tallas EU (calzado)</small>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {availableFilters.sizes.map((size: string) => (
              <button
                key={size}
                onClick={() => handleSizeToggle(size)}
                className={`min-w-[40px] px-3 py-2 border text-sm transition-colors ${
                  localFilters.sizes.includes(size)
                    ? 'border-primary-900 bg-primary-900 text-white'
                    : 'border-primary-300 hover:border-primary-500'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Precio */}
      <div>
        <h3 className="text-xs uppercase tracking-wider text-primary-500 mb-3">Precio</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-xs text-primary-400 mb-1 block">Mínimo</label>
              <input
                type="number"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                onBlur={handlePriceChange}
                min={availableFilters.priceRange.min}
                max={priceRange.max}
                className="w-full border border-primary-300 px-3 py-2 text-sm focus:outline-none focus:border-primary-900"
              />
            </div>
            <span className="text-primary-400 pt-4">-</span>
            <div className="flex-1">
              <label className="text-xs text-primary-400 mb-1 block">Máximo</label>
              <input
                type="number"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                onBlur={handlePriceChange}
                min={priceRange.min}
                max={availableFilters.priceRange.max}
                className="w-full border border-primary-300 px-3 py-2 text-sm focus:outline-none focus:border-primary-900"
              />
            </div>
          </div>
          <input
            type="range"
            min={availableFilters.priceRange.min}
            max={availableFilters.priceRange.max}
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
            onMouseUp={handlePriceChange}
            onTouchEnd={handlePriceChange}
            className="w-full accent-primary-900"
          />
        </div>
      </div>

      {/* Limpiar filtros */}
      <div className="pt-4 border-t border-primary-200">
        <button
          onClick={clearFilters}
          className="w-full text-sm text-primary-600 hover:text-primary-900 underline"
        >
          Limpiar todos los filtros
        </button>
      </div>

      {/* Contador de productos */}
      <p className="text-sm text-primary-500 text-center">
        {productCount} {productCount === 1 ? 'producto' : 'productos'}
      </p>
    </div>
  );
}
