/**
 * Sales Analytics Dashboard
 * Muestra estadísticas de ventas de los últimos 7 días con gráficos
 */
import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function SalesAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('sb-access-token') || localStorage.getItem('token') || '';
      const response = await fetch('/api/admin/analytics?days=7', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        // Include cookies in case the admin session is only stored in cookies
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al cargar analíticas');
      }

      const data = await response.json();
      setAnalytics(data);
      setError(null);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin">
          <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded">
        {error}
      </div>
    );
  }

  if (!analytics) {
    return <div className="p-4 text-primary-600">No hay datos disponibles</div>;
  }

  const { last7days, byDay } = analytics;

  // Preparar datos para gráficos
  const chartData = byDay.map((day: any) => ({
    date: new Date(day.date).toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric' }),
    revenue: day.revenue,
    orders: day.orders,
    items: day.items,
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-primary-200 p-6 rounded">
          <p className="text-sm text-primary-600 mb-1">Pedidos</p>
          <p className="text-3xl font-bold text-primary-900">{last7days.orders}</p>
          <p className="text-xs text-primary-500 mt-2">Últimos 7 días</p>
        </div>

        <div className="bg-white border border-primary-200 p-6 rounded">
          <p className="text-sm text-primary-600 mb-1">Ingresos</p>
          <p className="text-3xl font-bold text-green-600">€{last7days.revenue.toFixed(2)}</p>
          <p className="text-xs text-primary-500 mt-2">Total vendido</p>
        </div>

        <div className="bg-white border border-primary-200 p-6 rounded">
          <p className="text-sm text-primary-600 mb-1">Promedio/Pedido</p>
          <p className="text-3xl font-bold text-primary-900">€{last7days.averageOrder.toFixed(2)}</p>
          <p className="text-xs text-primary-500 mt-2">Ticket promedio</p>
        </div>

        <div className="bg-white border border-primary-200 p-6 rounded">
          <p className="text-sm text-primary-600 mb-1">Productos</p>
          <p className="text-3xl font-bold text-primary-900">{last7days.itemsSold}</p>
          <p className="text-xs text-primary-500 mt-2">Unidades vendidas</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Ingresos */}
        <div className="bg-white border border-primary-200 p-6 rounded">
          <h3 className="text-lg font-medium mb-4">Ingresos por Día</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: any) => `€${value.toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#667eea" name="Ingresos (€)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Pedidos y Productos */}
        <div className="bg-white border border-primary-200 p-6 rounded">
          <h3 className="text-lg font-medium mb-4">Pedidos y Productos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#667eea" name="Pedidos" />
              <Bar dataKey="items" fill="#764ba2" name="Productos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detalle por Día */}
      <div className="bg-white border border-primary-200 p-6 rounded">
        <h3 className="text-lg font-medium mb-4">Detalles por Día</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-primary-200">
                <th className="text-left py-2 px-4 font-medium">Fecha</th>
                <th className="text-right py-2 px-4 font-medium">Pedidos</th>
                <th className="text-right py-2 px-4 font-medium">Ingresos</th>
                <th className="text-right py-2 px-4 font-medium">Productos</th>
                <th className="text-right py-2 px-4 font-medium">Descuentos</th>
                <th className="text-right py-2 px-4 font-medium">Envío</th>
              </tr>
            </thead>
            <tbody>
              {byDay.map((day: any, idx: number) => (
                <tr key={idx} className="border-b border-primary-100 hover:bg-primary-50">
                  <td className="py-3 px-4">
                    {new Date(day.date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="py-3 px-4 text-right font-medium">{day.orders}</td>
                  <td className="py-3 px-4 text-right text-green-600 font-medium">€{day.revenue.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right">{day.items}</td>
                  <td className="py-3 px-4 text-right text-orange-600">€{day.discount.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right">€{day.shipping.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
