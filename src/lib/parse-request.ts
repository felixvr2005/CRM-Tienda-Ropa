/**
 * Utilidades para manejar tanto FormData como JSON en handlers
 */

export async function parseRequestData(request: Request): Promise<Record<string, any>> {
  const contentType = request.headers.get('content-type');
  
  if (contentType?.includes('application/json')) {
    // Si es JSON (desde fetch con headers)
    return await request.json();
  } else if (contentType?.includes('application/x-www-form-urlencoded') || contentType?.includes('multipart/form-data')) {
    // Si es FormData (desde formulario directo)
    const formData = await request.formData();
    const data: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    return data;
  }
  
  // Por defecto intentar JSON
  try {
    return await request.json();
  } catch {
    return {};
  }
}
