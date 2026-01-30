/**
 * Recomendador de Talla
 * Calcula la talla basada en altura y peso
 * Componente interactivo para modales
 */
import React from 'react';

interface SizeRecommendation {
  size: string;
  confidence: number;
  explanation: string;
}

/**
 * Lógica de recomendación basada en altura y peso
 */
function calculateRecommendedSize(height: number, weight: number): SizeRecommendation {
  // Lógica de recomendación
  if (height < 160 && weight < 55) {
    return {
      size: 'XS',
      confidence: 95,
      explanation: 'Basado en tu altura y peso, recomendamos talla XS para un ajuste perfecto.'
    };
  }
  
  if (height < 165 && weight < 65) {
    return {
      size: 'S',
      confidence: 90,
      explanation: 'Con tu altura y peso, la talla S debería quedarte cómoda.'
    };
  }
  
  if (height < 175 && weight < 80) {
    return {
      size: 'M',
      confidence: 90,
      explanation: 'La talla M es la más recomendada para tu complexión.'
    };
  }
  
  if (height < 185 && weight < 95) {
    return {
      size: 'L',
      confidence: 90,
      explanation: 'Basado en tu altura y peso, la talla L te quedará perfectamente.'
    };
  }
  
  if (height < 195 && weight < 110) {
    return {
      size: 'XL',
      confidence: 90,
      explanation: 'Para tu complexión, recomendamos la talla XL.'
    };
  }
  
  return {
    size: 'XXL',
    confidence: 85,
    explanation: 'Recomendamos la talla XXL. Si tienes dudas, contáctanos.'
  };
}

export default function SizeRecommender() {
  const [height, setHeight] = React.useState<number | ''>('');
  const [weight, setWeight] = React.useState<number | ''>('');
  const [recommendation, setRecommendation] = React.useState<SizeRecommendation | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleRecommend = () => {
    setError('');

    if (!height || !weight) {
      setError('Por favor ingresa altura y peso');
      return;
    }

    const h = Number(height);
    const w = Number(weight);

    if (h < 140 || h > 220) {
      setError('Altura debe estar entre 140 y 220 cm');
      return;
    }

    if (w < 40 || w > 200) {
      setError('Peso debe estar entre 40 y 200 kg');
      return;
    }

    const result = calculateRecommendedSize(h, w);
    setRecommendation(result);
  };

  const handleSelectSize = (size: string) => {
    // Enviar evento para seleccionar talla
    window.dispatchEvent(
      new CustomEvent('sizeSelected', {
        detail: { size }
      })
    );
    setShowModal(false);
  };

  if (!showModal) {
    return (
      <button
        onClick={() => setShowModal(true)}
        className="mt-4 px-4 py-2 border border-primary-300 text-primary-600 text-sm hover:bg-primary-50 transition-colors rounded"
      >
        ❓ ¿Cuál es mi talla?
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-display font-medium">Recomendador de Talla</h3>
          <button
            onClick={() => {
              setShowModal(false);
              setRecommendation(null);
              setHeight('');
              setWeight('');
              setError('');
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!recommendation ? (
          <div className="space-y-4">
            <p className="text-sm text-primary-600">
              Cuéntanos tu altura y peso para recomendarte la talla perfecta.
            </p>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">
                Altura (cm)
              </label>
              <input
                type="number"
                min="140"
                max="220"
                value={height}
                onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : '')}
                placeholder="Ej: 175"
                className="w-full px-3 py-2 border border-primary-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">
                Peso (kg)
              </label>
              <input
                type="number"
                min="40"
                max="200"
                value={weight}
                onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')}
                placeholder="Ej: 75"
                className="w-full px-3 py-2 border border-primary-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <button
              onClick={handleRecommend}
              className="w-full bg-primary-600 text-white py-2 rounded font-medium hover:bg-primary-700 transition-colors"
            >
              Obtener Recomendación
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-primary-600 mb-2">Te recomendamos:</p>
              <p className="text-4xl font-bold text-green-600 mb-2">
                {recommendation.size}
              </p>
              <p className="text-sm text-primary-700">
                {recommendation.explanation}
              </p>
              <p className="text-xs text-primary-500 mt-2">
                Confianza: {recommendation.confidence}%
              </p>
            </div>

            <p className="text-xs text-primary-600">
              Nota: Esta es una recomendación basada en tu altura y peso. Si tienes dudas, consulta la tabla de medidas detallada.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleSelectSize(recommendation.size)}
                className="w-full bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700 transition-colors"
              >
                Seleccionar {recommendation.size}
              </button>

              <button
                onClick={() => {
                  setRecommendation(null);
                  setHeight('');
                  setWeight('');
                  setError('');
                }}
                className="w-full border border-primary-300 text-primary-600 py-2 rounded font-medium hover:bg-primary-50 transition-colors"
              >
                Recalcular
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}