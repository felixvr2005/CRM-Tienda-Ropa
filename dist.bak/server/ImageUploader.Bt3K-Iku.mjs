import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';

function ImageUploader({
  onUpload = () => {
  },
  onRemove,
  existingImages = [],
  maxImages = 10,
  folder = "productos"
}) {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  useEffect(() => {
    if (window.cloudinary) {
      setWidgetLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://upload-widget.cloudinary.com/global/all.js";
    script.async = true;
    script.onload = () => setWidgetLoaded(true);
    document.body.appendChild(script);
    return () => {
    };
  }, []);
  const openWidget = () => {
    if (!widgetLoaded || !window.cloudinary) {
      alert("El widget de carga aún no está listo. Por favor, espera un momento.");
      return;
    }
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: "dwyksbbk0",
        uploadPreset: "tienda_productos",
        folder,
        sources: ["local", "url", "camera"],
        multiple: true,
        maxFiles: maxImages - images.length,
        maxFileSize: 1e7,
        // 10MB
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
        cropping: true,
        croppingAspectRatio: 0.8,
        showSkipCropButton: true,
        styles: {
          palette: {
            window: "#FFFFFF",
            windowBorder: "#CBD5E1",
            tabIcon: "#3B82F6",
            menuIcons: "#64748B",
            textDark: "#1E293B",
            textLight: "#FFFFFF",
            link: "#3B82F6",
            action: "#F97316",
            inactiveTabIcon: "#94A3B8",
            error: "#EF4444",
            inProgress: "#3B82F6",
            complete: "#22C55E",
            sourceBg: "#F1F5F9"
          },
          fonts: {
            default: null,
            "'Inter', sans-serif": {
              url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
              active: true
            }
          }
        }
      },
      (error, result) => {
        if (error) {
          console.error("Error en upload:", error);
          return;
        }
        if (result.event === "success") {
          const newImage = {
            public_id: result.info.public_id,
            secure_url: result.info.secure_url,
            width: result.info.width,
            height: result.info.height,
            format: result.info.format,
            bytes: result.info.bytes
          };
          setImages((prev) => {
            const updated = [...prev, newImage];
            if (onUpload) {
              onUpload([newImage]);
            }
            if (window.handleImagesUpload) {
              window.handleImagesUpload([newImage]);
            }
            return updated;
          });
        }
        if (result.event === "close") {
          onUpload(images);
        }
        if (result.event === "queues-end") {
          setIsLoading(false);
        }
        if (result.event === "queues-start") {
          setIsLoading(true);
        }
      }
    );
    widget.open();
  };
  const handleRemove = async (publicId) => {
    if (!confirm("¿Eliminar esta imagen?")) return;
    try {
      const response = await fetch("/api/admin/images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId })
      });
      if (response.ok) {
        setImages((prev) => prev.filter((img) => img.public_id !== publicId));
        onRemove?.(publicId);
      } else {
        alert("Error al eliminar la imagen");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar la imagen");
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      images.map((image, index) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "relative group aspect-[4/5] rounded-lg overflow-hidden border border-gray-200",
          children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: image.secure_url,
                alt: `Imagen ${index + 1}`,
                className: "w-full h-full object-cover"
              }
            ),
            index === 0 && /* @__PURE__ */ jsx("span", { className: "absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded", children: "Principal" }),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center", children: /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => handleRemove(image.public_id),
                className: "bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors",
                title: "Eliminar imagen",
                children: /* @__PURE__ */ jsx(
                  "svg",
                  {
                    xmlns: "http://www.w3.org/2000/svg",
                    className: "h-5 w-5",
                    viewBox: "0 0 20 20",
                    fill: "currentColor",
                    children: /* @__PURE__ */ jsx(
                      "path",
                      {
                        fillRule: "evenodd",
                        d: "M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z",
                        clipRule: "evenodd"
                      }
                    )
                  }
                )
              }
            ) })
          ]
        },
        image.public_id
      )),
      images.length < maxImages && /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: openWidget,
          disabled: isLoading || !widgetLoaded,
          className: "aspect-[4/5] rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed",
          children: isLoading ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs(
              "svg",
              {
                className: "animate-spin h-8 w-8",
                xmlns: "http://www.w3.org/2000/svg",
                fill: "none",
                viewBox: "0 0 24 24",
                children: [
                  /* @__PURE__ */ jsx(
                    "circle",
                    {
                      className: "opacity-25",
                      cx: "12",
                      cy: "12",
                      r: "10",
                      stroke: "currentColor",
                      strokeWidth: "4"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "path",
                    {
                      className: "opacity-75",
                      fill: "currentColor",
                      d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Subiendo..." })
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(
              "svg",
              {
                xmlns: "http://www.w3.org/2000/svg",
                className: "h-8 w-8",
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor",
                children: /* @__PURE__ */ jsx(
                  "path",
                  {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: 2,
                    d: "M12 4v16m8-8H4"
                  }
                )
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Agregar imágenes" }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-400", children: [
              images.length,
              "/",
              maxImages
            ] })
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Arrastra las imágenes para reordenarlas. La primera imagen será la principal. Formatos: JPG, PNG, WebP. Máximo 10MB por imagen." })
  ] });
}

export { ImageUploader as I };
