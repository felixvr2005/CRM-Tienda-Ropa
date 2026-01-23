/* empty css                                 */
import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead, o as Fragment$1, h as addAttribute } from '../../astro/server._DgZez_d.mjs';
import 'piccolore';
import { b as addToCart, a as $$PublicLayout } from '../../PublicLayout.D3A_txxX.mjs';
import { $ as $$ProductCard } from '../../ProductCard.CWUmvDiI.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import React, { useState, useEffect, useMemo } from 'react';
import { f as formatPrice, c as calculateDiscountedPrice } from '../../utils.Ceah_axf.mjs';
import { c as getProductBySlug, d as getProducts, s as supabase } from '../../supabase.41eewI-c.mjs';
export { renderers } from '../../renderers.mjs';

function ProductImageGallery({
  productId,
  variants,
  variantImages,
  productName,
  defaultImages,
  selectedColor: externalSelectedColor,
  onColorChange
}) {
  const [localSelectedColor, setLocalSelectedColor] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState(defaultImages);
  const selectedColor = externalSelectedColor ?? localSelectedColor;
  const setSelectedColor = onColorChange ? (c) => onColorChange(c) : setLocalSelectedColor;
  useEffect(() => {
    console.log("🔍 ProductImageGallery Debug:");
    console.log("Variants:", variants);
    console.log("VariantImages object:", variantImages);
    console.log("Number of variants:", variants.length);
  }, [variants, variantImages]);
  const colors = useMemo(() => {
    if (!variants || variants.length === 0) return [];
    const uniqueColors = /* @__PURE__ */ new Map();
    variants.forEach((v) => {
      if (v.color && v.color.trim()) {
        if (!uniqueColors.has(v.color)) {
          uniqueColors.set(v.color, {
            hex: v.color_hex || "#808080",
            stock: 0
          });
        }
        const colorData = uniqueColors.get(v.color);
        if (colorData) {
          colorData.stock = Math.max(colorData.stock, v.stock || 0);
        }
      }
    });
    const result = Array.from(uniqueColors.entries()).map(([name, data]) => ({
      name,
      hex: data.hex,
      stock: data.stock
    }));
    console.log("Colors found:", result);
    return result;
  }, [variants]);
  useEffect(() => {
    if (colors.length > 0 && !selectedColor) {
      console.log("Auto-selecting first color:", colors[0].name);
      setSelectedColor(colors[0].name);
    }
  }, [colors, selectedColor]);
  useEffect(() => {
    if (!selectedColor) {
      console.log("⚠️ No selectedColor");
      return;
    }
    console.log("🎨 Color seleccionado:", selectedColor);
    const variant = variants.find((v) => v.color === selectedColor);
    console.log("Found variant:", variant);
    if (variant) {
      console.log(`📸 Buscando imágenes para variant.id: ${variant.id}`);
      const variantImgs = variantImages[variant.id];
      console.log("Imágenes encontradas:", variantImgs);
      if (variantImgs && Array.isArray(variantImgs) && variantImgs.length > 0) {
        const sortedImages = variantImgs.sort((a, b) => {
          if (a.is_primary) return -1;
          if (b.is_primary) return 1;
          return (a.sort_order || 0) - (b.sort_order || 0);
        }).map((img) => img.image_url);
        console.log("✅ Imágenes ordenadas:", sortedImages);
        setImages(sortedImages);
      } else {
        console.log("⚠️ Sin imágenes para esta variante, usando default");
        setImages(defaultImages);
      }
    } else {
      console.log("❌ Variante no encontrada para color:", selectedColor);
      console.log("Available colors in variants:", variants.map((v) => v.color));
    }
    setCurrentImageIndex(0);
  }, [selectedColor, variants, variantImages, defaultImages]);
  const goToPrevious = () => {
    setCurrentImageIndex(
      (prev) => prev === 0 ? images.length - 1 : prev - 1
    );
  };
  const goToNext = () => {
    setCurrentImageIndex(
      (prev) => prev === images.length - 1 ? 0 : prev + 1
    );
  };
  return /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative w-full aspect-square bg-primary-50 rounded-lg overflow-hidden mb-4 group", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: images[currentImageIndex],
          alt: `${productName} - ${selectedColor} - imagen ${currentImageIndex + 1}`,
          className: "w-full h-full object-cover"
        }
      ),
      images.length > 1 && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: goToPrevious,
            className: "absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-primary-900 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
            "aria-label": "Imagen anterior",
            children: /* @__PURE__ */ jsx(
              "svg",
              {
                className: "w-6 h-6",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                children: /* @__PURE__ */ jsx(
                  "path",
                  {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: 2,
                    d: "M15 19l-7-7 7-7"
                  }
                )
              }
            )
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: goToNext,
            className: "absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-primary-900 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
            "aria-label": "Siguiente imagen",
            children: /* @__PURE__ */ jsx(
              "svg",
              {
                className: "w-6 h-6",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                children: /* @__PURE__ */ jsx(
                  "path",
                  {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: 2,
                    d: "M9 5l7 7-7 7"
                  }
                )
              }
            )
          }
        )
      ] }),
      images.length > 1 && /* @__PURE__ */ jsxs("div", { className: "absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm", children: [
        currentImageIndex + 1,
        " / ",
        images.length
      ] })
    ] }),
    images.length > 1 && /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 gap-2 mb-6", children: images.map((img, idx) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setCurrentImageIndex(idx),
        className: `aspect-square rounded-lg overflow-hidden transition-all ${idx === currentImageIndex ? "ring-2 ring-primary-900" : "ring-1 ring-primary-200 hover:ring-primary-500"}`,
        "aria-label": `Ver imagen ${idx + 1}`,
        children: /* @__PURE__ */ jsx(
          "img",
          {
            src: img,
            alt: `Thumbnail ${idx + 1}`,
            className: "w-full h-full object-cover"
          }
        )
      },
      idx
    )) }),
    images.length > 0 && images[currentImageIndex] && /* @__PURE__ */ jsxs("p", { className: "text-xs text-primary-500 text-center", children: [
      "Imagen ",
      currentImageIndex + 1,
      " de ",
      images.length
    ] })
  ] });
}

function AddToCartButton({
  productId,
  productName,
  productSlug,
  productPrice,
  productDiscount,
  productImage,
  variants,
  variantImages = {},
  selectedColor: externalSelectedColor,
  onColorChange
}) {
  const [selectedSize, setSelectedSize] = useState(null);
  const [localSelectedColor, setLocalSelectedColor] = useState(null);
  const selectedColor = externalSelectedColor ?? localSelectedColor;
  const setSelectedColor = onColorChange ? (c) => onColorChange(c) : setLocalSelectedColor;
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const sizes = useMemo(() => {
    const sizeSet = /* @__PURE__ */ new Set();
    variants.forEach((v) => sizeSet.add(v.size));
    return Array.from(sizeSet);
  }, [variants]);
  const colors = useMemo(() => {
    const uniqueColors = /* @__PURE__ */ new Map();
    variants.forEach((v) => {
      if (!uniqueColors.has(v.color)) {
        uniqueColors.set(v.color, v.color_hex || "#000000");
      }
    });
    return Array.from(uniqueColors.entries()).map(([name, hex]) => ({ name, hex }));
  }, [variants]);
  const selectedVariant = useMemo(() => {
    if (!selectedSize || !selectedColor) return null;
    return variants.find((v) => v.size === selectedSize && v.color === selectedColor);
  }, [selectedSize, selectedColor, variants]);
  const colorImage = useMemo(() => {
    if (!selectedColor || !selectedVariant) return productImage;
    const images = variantImages[selectedVariant.id];
    if (images && images.length > 0) {
      const primaryImage = images.find((img) => img.is_primary);
      return primaryImage ? primaryImage.image_url : images[0].image_url;
    }
    return productImage;
  }, [selectedColor, selectedVariant, variantImages, productImage]);
  const isAvailable = (size, color) => {
    const variant = variants.find((v) => v.size === size && v.color === color);
    return variant && variant.stock > 0;
  };
  const currentStock = selectedVariant?.stock ?? 0;
  const finalPrice = calculateDiscountedPrice(productPrice, productDiscount);
  const handleAddToCart = () => {
    if (!selectedSize) {
      setError("Selecciona una talla");
      return;
    }
    if (!selectedColor) {
      setError("Selecciona un color");
      return;
    }
    if (!selectedVariant || selectedVariant.stock <= 0) {
      setError("Combinación no disponible");
      return;
    }
    setIsAdding(true);
    setError(null);
    addToCart({
      id: selectedVariant.id,
      productId,
      variantId: selectedVariant.id,
      name: productName,
      slug: productSlug,
      price: finalPrice,
      originalPrice: productPrice,
      discount: productDiscount,
      image: colorImage,
      size: selectedSize,
      color: selectedColor,
      maxStock: selectedVariant.stock
    });
    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-3", children: /* @__PURE__ */ jsx("span", { className: "text-sm text-primary-500 uppercase tracking-wider", children: "Color" }) }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: colors.map(({ name, hex }) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            setSelectedColor(name);
            setError(null);
          },
          className: `w-8 h-8 rounded-full border-2 transition-all ${selectedColor === name ? "border-primary-900 ring-1 ring-offset-1 ring-primary-900" : "border-primary-200 hover:border-primary-400"}`,
          style: { backgroundColor: hex },
          title: name,
          "aria-label": name
        },
        name
      )) })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm text-primary-500 uppercase tracking-wider", children: "Talla" }),
        /* @__PURE__ */ jsx("button", { className: "text-xs text-primary-500 underline hover:text-primary-900", children: "Guía de tallas" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 gap-2", children: sizes.map((size) => {
        const available = selectedColor ? isAvailable(size, selectedColor) : variants.some((v) => v.size === size && v.stock > 0);
        return /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              if (available) {
                setSelectedSize(size);
                setError(null);
              }
            },
            disabled: !available,
            className: `py-3 text-sm border transition-all ${selectedSize === size ? "border-primary-900 bg-primary-900 text-white" : available ? "border-primary-300 hover:border-primary-900" : "border-primary-200 text-primary-300 cursor-not-allowed line-through"}`,
            children: size
          },
          size
        );
      }) })
    ] }),
    selectedVariant && currentStock > 0 && currentStock <= 5 && /* @__PURE__ */ jsxs("p", { className: "text-sm text-amber-600", children: [
      "⚠️ Solo quedan ",
      currentStock,
      " unidades"
    ] }),
    error && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600", children: error }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: handleAddToCart,
        disabled: isAdding,
        className: `w-full py-4 text-sm tracking-widest uppercase font-medium transition-all ${isAdding ? "bg-green-600 text-white" : "bg-primary-900 text-white hover:bg-primary-800"}`,
        children: isAdding ? /* @__PURE__ */ jsxs("span", { className: "flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M5 13l4 4L19 7" }) }),
          "Añadido"
        ] }) : `Añadir - ${formatPrice(finalPrice)}`
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "space-y-3 pt-4 border-t border-primary-200", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-sm text-primary-600", children: [
        /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", d: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" }) }),
        /* @__PURE__ */ jsx("span", { children: "Envío gratis a partir de 100€" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-sm text-primary-600", children: [
        /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" }) }),
        /* @__PURE__ */ jsx("span", { children: "Devolución gratuita en 30 días" })
      ] })
    ] })
  ] });
}

function calculateRecommendedSize(height, weight) {
  if (height < 160 && weight < 55) {
    return {
      size: "XS",
      confidence: 95,
      explanation: "Basado en tu altura y peso, recomendamos talla XS para un ajuste perfecto."
    };
  }
  if (height < 165 && weight < 65) {
    return {
      size: "S",
      confidence: 90,
      explanation: "Con tu altura y peso, la talla S debería quedarte cómoda."
    };
  }
  if (height < 175 && weight < 80) {
    return {
      size: "M",
      confidence: 90,
      explanation: "La talla M es la más recomendada para tu complexión."
    };
  }
  if (height < 185 && weight < 95) {
    return {
      size: "L",
      confidence: 90,
      explanation: "Basado en tu altura y peso, la talla L te quedará perfectamente."
    };
  }
  if (height < 195 && weight < 110) {
    return {
      size: "XL",
      confidence: 90,
      explanation: "Para tu complexión, recomendamos la talla XL."
    };
  }
  return {
    size: "XXL",
    confidence: 85,
    explanation: "Recomendamos la talla XXL. Si tienes dudas, contáctanos."
  };
}
function SizeRecommender() {
  const [height, setHeight] = React.useState("");
  const [weight, setWeight] = React.useState("");
  const [recommendation, setRecommendation] = React.useState(null);
  const [showModal, setShowModal] = React.useState(false);
  const [error, setError] = React.useState("");
  const handleRecommend = () => {
    setError("");
    if (!height || !weight) {
      setError("Por favor ingresa altura y peso");
      return;
    }
    const h = Number(height);
    const w = Number(weight);
    if (h < 140 || h > 220) {
      setError("Altura debe estar entre 140 y 220 cm");
      return;
    }
    if (w < 40 || w > 200) {
      setError("Peso debe estar entre 40 y 200 kg");
      return;
    }
    const result = calculateRecommendedSize(h, w);
    setRecommendation(result);
  };
  const handleSelectSize = (size) => {
    window.dispatchEvent(
      new CustomEvent("sizeSelected", {
        detail: { size }
      })
    );
    setShowModal(false);
  };
  if (!showModal) {
    return /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setShowModal(true),
        className: "mt-4 px-4 py-2 border border-primary-300 text-primary-600 text-sm hover:bg-primary-50 transition-colors rounded",
        children: "❓ ¿Cuál es mi talla?"
      }
    );
  }
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg max-w-md w-full p-6 shadow-xl", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-xl font-display font-medium", children: "Recomendador de Talla" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            setShowModal(false);
            setRecommendation(null);
            setHeight("");
            setWeight("");
            setError("");
          },
          className: "text-gray-500 hover:text-gray-700",
          children: "✕"
        }
      )
    ] }),
    !recommendation ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-primary-600", children: "Cuéntanos tu altura y peso para recomendarte la talla perfecta." }),
      error && /* @__PURE__ */ jsx("div", { className: "p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded", children: error }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-primary-900 mb-1", children: "Altura (cm)" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            min: "140",
            max: "220",
            value: height,
            onChange: (e) => setHeight(e.target.value ? Number(e.target.value) : ""),
            placeholder: "Ej: 175",
            className: "w-full px-3 py-2 border border-primary-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-600"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-primary-900 mb-1", children: "Peso (kg)" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            min: "40",
            max: "200",
            value: weight,
            onChange: (e) => setWeight(e.target.value ? Number(e.target.value) : ""),
            placeholder: "Ej: 75",
            className: "w-full px-3 py-2 border border-primary-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-600"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleRecommend,
          className: "w-full bg-primary-600 text-white py-2 rounded font-medium hover:bg-primary-700 transition-colors",
          children: "Obtener Recomendación"
        }
      )
    ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-4 bg-green-50 border border-green-200 rounded", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-primary-600 mb-2", children: "Te recomendamos:" }),
        /* @__PURE__ */ jsx("p", { className: "text-4xl font-bold text-green-600 mb-2", children: recommendation.size }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-primary-700", children: recommendation.explanation }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-primary-500 mt-2", children: [
          "Confianza: ",
          recommendation.confidence,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-primary-600", children: "💡 Esta es una recomendación basada en tu altura y peso. Si tienes dudas, consulta la tabla de medidas detallada." }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => handleSelectSize(recommendation.size),
            className: "w-full bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700 transition-colors",
            children: [
              "Seleccionar ",
              recommendation.size
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              setRecommendation(null);
              setHeight("");
              setWeight("");
              setError("");
            },
            className: "w-full border border-primary-300 text-primary-600 py-2 rounded font-medium hover:bg-primary-50 transition-colors",
            children: "Recalcular"
          }
        )
      ] })
    ] })
  ] }) });
}

function ProductViewer({
  productId,
  productName,
  productSlug,
  productPrice,
  productDiscount,
  productImage,
  variants,
  variantImages
}) {
  const [selectedColor, setSelectedColor] = useState(null);
  const colors = useMemo(() => {
    const uniqueColors = /* @__PURE__ */ new Map();
    variants.forEach((v) => {
      if (!uniqueColors.has(v.color)) {
        uniqueColors.set(v.color, v.color_hex || "#000000");
      }
    });
    return Array.from(uniqueColors.entries()).map(([name, hex]) => ({ name, hex }));
  }, [variants]);
  const firstColor = colors.length > 0 ? colors[0].name : null;
  const priceInEuros = productPrice / 100;
  const discountedPrice = priceInEuros * (1 - productDiscount / 100);
  return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16", children: [
    /* @__PURE__ */ jsx("div", { className: "lg:sticky lg:top-24 lg:self-start", children: /* @__PURE__ */ jsx(
      ProductImageGallery,
      {
        productId,
        variants,
        variantImages,
        productName,
        defaultImages: [productImage],
        selectedColor: selectedColor || firstColor,
        onColorChange: setSelectedColor
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "py-4", children: [
      /* @__PURE__ */ jsx("h1", { className: "font-display text-3xl mb-4", children: productName }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-3 mb-8", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-2xl font-bold text-primary-900", children: [
          "€",
          discountedPrice.toFixed(2)
        ] }),
        productDiscount > 0 && /* @__PURE__ */ jsxs("span", { className: "text-lg text-primary-400 line-through", children: [
          "€",
          priceInEuros.toFixed(2)
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        AddToCartButton,
        {
          productId,
          productName,
          productSlug,
          productPrice,
          productDiscount,
          productImage,
          variants,
          variantImages,
          selectedColor,
          onColorChange: setSelectedColor
        }
      ),
      /* @__PURE__ */ jsx(SizeRecommender, {})
    ] })
  ] });
}

const $$Astro = createAstro();
const prerender = false;
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { slug } = Astro2.params;
  const product = await getProductBySlug(slug || "");
  if (!product) {
    return Astro2.redirect("/productos");
  }
  calculateDiscountedPrice(product.price, product.discount_percentage);
  product.discount_percentage > 0;
  const allProducts = await getProducts();
  const relatedProducts = allProducts.filter((p) => p.category_id === product.category_id && p.id !== product.id).slice(0, 4);
  const { data: variants } = await supabase.from("product_variants").select("*").eq("product_id", product.id);
  console.log(`[Astro] Cargar variantes para producto ${product.id}:`, variants?.length);
  let variantImages = {};
  if (variants && variants.length > 0) {
    for (const variant of variants) {
      const { data: images } = await supabase.from("variant_images").select("*").eq("variant_id", variant.id).order("sort_order", { ascending: true });
      console.log(`[Astro] Variante ${variant.id} (${variant.color}): ${images?.length} im\xE1genes`);
      variantImages[variant.id] = images || [];
    }
  }
  console.log("[Astro] variantImages keys:", Object.keys(variantImages).length);
  let defaultImages = ["/images/products/placeholder.jpg"];
  if (variants && variants.length > 0) {
    const firstVariant = variants[0];
    if (variantImages[firstVariant.id] && variantImages[firstVariant.id].length > 0) {
      defaultImages = variantImages[firstVariant.id].map((img) => img.image_url);
    }
  }
  return renderTemplate`${renderComponent($$result, "PublicLayout", $$PublicLayout, { "title": product.name }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-[1800px] mx-auto px-4 lg:px-8 py-8"> <!-- Breadcrumb --> <nav class="text-sm text-primary-500 mb-8"> <a href="/" class="hover:text-primary-900">Inicio</a> <span class="mx-2">/</span> <a href="/productos" class="hover:text-primary-900">Colección</a> ${product.category && renderTemplate`${renderComponent($$result2, "Fragment", Fragment$1, {}, { "default": async ($$result3) => renderTemplate` <span class="mx-2">/</span> <a${addAttribute(`/categoria/${product.category.slug}`, "href")} class="hover:text-primary-900"> ${product.category.name} </a> ` })}`} <span class="mx-2">/</span> <span class="text-primary-900">${product.name}</span> </nav> <!-- Product Layout --> ${renderComponent($$result2, "ProductViewer", ProductViewer, { "client:load": true, "productId": product.id, "productName": product.name, "productSlug": product.slug, "productPrice": product.price, "productDiscount": product.discount_percentage, "productImage": defaultImages[0] || "/images/products/placeholder.jpg", "variants": variants || [], "variantImages": variantImages, "client:component-hydration": "load", "client:component-path": "@components/islands/ProductViewer", "client:component-export": "default" })} <!-- Badges & Category --> ${(product.is_new || product.discount_percentage > 0) && renderTemplate`<div class="mt-8 flex gap-2"> ${product.is_new && renderTemplate`<span class="bg-primary-900 text-white text-2xs tracking-widest uppercase px-2 py-1">
Nuevo
</span>`} ${product.discount_percentage > 0 && renderTemplate`<span class="bg-red-600 text-white text-2xs tracking-widest uppercase px-2 py-1">
-${product.discount_percentage}%
</span>`} </div>`} <!-- Accordions --> <div class="mt-12 border-t border-primary-200 max-w-3xl"> <details class="group"> <summary class="flex items-center justify-between py-4 cursor-pointer"> <span class="text-sm font-medium uppercase tracking-wider">Descripción del producto</span> <svg class="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7"></path> </svg> </summary> <div class="pb-4 text-sm text-primary-600"> ${product.description || "Prenda de alta calidad dise\xF1ada con los mejores materiales."} </div> </details> <details class="group border-t border-primary-200"> <summary class="flex items-center justify-between py-4 cursor-pointer"> <span class="text-sm font-medium uppercase tracking-wider">Composición y cuidados</span> <svg class="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7"></path> </svg> </summary> <div class="pb-4 text-sm text-primary-600 space-y-2"> <p>100% Algodón premium</p> <p>Lavar a máquina máx. 30°C</p> <p>No usar secadora</p> <p>Planchar a temperatura media</p> </div> </details> <details class="group border-t border-primary-200"> <summary class="flex items-center justify-between py-4 cursor-pointer"> <span class="text-sm font-medium uppercase tracking-wider">Envío y devoluciones</span> <svg class="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7"></path> </svg> </summary> <div class="pb-4 text-sm text-primary-600 space-y-2"> <p>Envío estándar: 2-4 días laborables (5,95€)</p> <p>Envío gratis en pedidos superiores a 100€</p> <p>Devolución gratuita en 30 días</p> </div> </details> </div> <!-- Related Products --> ${relatedProducts.length > 0 && renderTemplate`<section class="mt-20"> <h2 class="font-display text-2xl mb-8">También te puede gustar</h2> <div class="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8"> ${relatedProducts.map((p) => renderTemplate`${renderComponent($$result2, "ProductCard", $$ProductCard, { "product": p })}`)} </div> </section>`} </div> ` })}`;
}, "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/productos/[slug].astro", void 0);

const $$file = "C:/Users/Felix/Desktop/CRM-Tienda Ropa/src/pages/productos/[slug].astro";
const $$url = "/productos/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
