export { renderers } from '../../../renderers.mjs';

const cloudinaryConfig = {
  cloudName: "dwyksbbk0",
  apiKey: "728481631991241",
  apiSecret: "1kNcl6UR3P_BVNN9FdyqV_9isKs"
};
async function generateUploadSignature(paramsToSign) {
  if (typeof window !== "undefined") {
    throw new Error("generateUploadSignature debe ejecutarse solo en el servidor");
  }
  const crypto = await import('crypto');
  const sortedParams = Object.keys(paramsToSign).sort().map((key) => `${key}=${paramsToSign[key]}`).join("&");
  const signature = crypto.createHash("sha1").update(sortedParams + cloudinaryConfig.apiSecret).digest("hex");
  return signature;
}
async function deleteImage(publicId) {
  if (typeof window !== "undefined") {
    throw new Error("deleteImage debe ejecutarse solo en el servidor");
  }
  try {
    const timestamp = Math.floor(Date.now() / 1e3);
    const signature = await generateUploadSignature({
      public_id: publicId,
      timestamp: timestamp.toString()
    });
    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("signature", signature);
    formData.append("api_key", cloudinaryConfig.apiKey);
    formData.append("timestamp", timestamp.toString());
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/destroy`,
      {
        method: "POST",
        body: formData
      }
    );
    const result = await response.json();
    return result.result === "ok";
  } catch (error) {
    console.error("Error eliminando imagen de Cloudinary:", error);
    return false;
  }
}

const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const { paramsToSign } = body;
    if (!paramsToSign) {
      return new Response(
        JSON.stringify({ error: "Parámetros requeridos" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const signature = await generateUploadSignature(paramsToSign);
    return new Response(
      JSON.stringify({ signature }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generando firma:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
const DELETE = async ({ request }) => {
  try {
    const body = await request.json();
    const { publicId } = body;
    if (!publicId) {
      return new Response(
        JSON.stringify({ error: "publicId requerido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const success = await deleteImage(publicId);
    if (success) {
      return new Response(
        JSON.stringify({ message: "Imagen eliminada correctamente" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "No se pudo eliminar la imagen" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error eliminando imagen:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
