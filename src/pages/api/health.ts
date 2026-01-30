export const prerender = false;

export async function GET() {
  try {
    const checks: Record<string, any> = { status: 'ok' };

    // Optional deeper checks when service keys are present
    if (process.env.SUPABASE_SERVICE_KEY && process.env.PUBLIC_SUPABASE_URL) {
      try {
        const res = await fetch(`${process.env.PUBLIC_SUPABASE_URL}/rest/v1/?select=1`, {
          method: 'HEAD',
          headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}` },
        });
        checks.supabase = res.ok ? 'ok' : `error:${res.status}`;
      } catch (err: any) {
        checks.supabase = `error:${err.message}`;
      }
    }

    // Basic memory/uptime info
    checks.uptime = process.uptime();
    checks.time = new Date().toISOString();

    return new Response(JSON.stringify(checks), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ status: 'error', message: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
