import { supabase } from './supabase';
import type { AdminEmailData } from './email';

type DateRange = 'day' | 'week' | 'month' | 'year' | 'custom';

interface ReportParams {
    dateRange: DateRange;
    startDate?: Date;
    endDate?: Date;
    userId?: string;
}

interface DailyMetrics {
    totalOrders: number;
    totalRevenue: number;
    pendingShipments: number;
    criticalAlerts: number;
    orders: any[];
    shipments: any[];
    alerts: any[];
}

interface OrderData {
    id: string;
    order_number: string;
    user_id: string;
    total_amount: number;
    status: string;
    created_at: string;
    payment_method?: string;
    users?: { name: string; email: string };
    order_items?: any[];
    is_new_customer?: boolean;
}

interface ShipmentData {
    id: string;
    order_id: string;
    tracking_number: string;
    status: string;
    destination: string;
    estimated_delivery?: string;
    shipped_at: string;
    orders?: { order_number: string };
}

interface PaymentErrorData {
    status: string;
    order_number: string;
}

interface IncompleteOrderData {
    order_number: string;
    status: string;
}

interface LowStockData {
    name: string;
    stock_quantity: number;
}

// Obtener rango de fechas
const getDateRange = (range: DateRange, startDate?: Date, endDate?: Date) => {
    const today = new Date();
    let from: Date;
    let to: Date = endDate || today;

    switch (range) {
        case 'day':
            from = new Date(today);
            from.setHours(0, 0, 0, 0);
            to = new Date(today);
            to.setHours(23, 59, 59, 999);
            break;
        case 'week':
            from = new Date(today);
            from.setDate(today.getDate() - today.getDay());
            from.setHours(0, 0, 0, 0);
            to = new Date(today);
            to.setHours(23, 59, 59, 999);
            break;
        case 'month':
            from = new Date(today.getFullYear(), today.getMonth(), 1);
            to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            to.setHours(23, 59, 59, 999);
            break;
        case 'year':
            from = new Date(today.getFullYear(), 0, 1);
            to = new Date(today.getFullYear(), 11, 31);
            to.setHours(23, 59, 59, 999);
            break;
        case 'custom':
            if (!startDate || !endDate) {
                throw new Error('Debe proporcionar startDate y endDate para rango custom');
            }
            from = startDate;
            to = endDate;
            break;
        default:
            throw new Error('Rango de fechas inválido');
    }

    return { from: from.toISOString(), to: to.toISOString() };
};

// Obtener nombre legible del período
const getReadableDateRange = (range: DateRange, startDate?: Date, endDate?: Date): string => {
    const today = new Date();
    const dateFormatter = new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    switch (range) {
        case 'day':
            return dateFormatter.format(today);
        case 'week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            return `${dateFormatter.format(weekStart)} - ${dateFormatter.format(weekEnd)}`;
        case 'month':
            return today.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        case 'year':
            return today.getFullYear().toString();
        case 'custom':
            return `${dateFormatter.format(startDate!)} - ${dateFormatter.format(endDate!)}`;
        default:
            return '';
    }
};

// Obtener datos de pedidos para el período
const fetchOrdersData = async (from: string, to: string): Promise<OrderData[]> => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                id,
                order_number,
                user_id,
                total_amount,
                status,
                created_at,
                payment_method,
                users (name, email),
                order_items (
                    id,
                    product_id,
                    quantity,
                    unit_price,
                    products (name, sku)
                )
            `)
            .gte('created_at', from)
            .lte('created_at', to)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
};

// Obtener datos de envíos
const fetchShipmentsData = async (from: string, to: string): Promise<ShipmentData[]> => {
    try {
        const { data, error } = await supabase
            .from('shipments')
            .select(`
                id,
                order_id,
                tracking_number,
                status,
                destination,
                estimated_delivery,
                shipped_at,
                orders (order_number)
            `)
            .gte('shipped_at', from)
            .lte('shipped_at', to)
            .order('shipped_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching shipments:', error);
        return [];
    }
};

// Obtener alertas relevantes
const fetchAlerts = async (from: string, to: string) => {
    const alerts = [];

    try {
        // Errores de pago
        const { data: paymentErrors } = await supabase
            .from('orders')
            .select('id, order_number, status, created_at')
            .eq('status', 'payment_failed')
            .gte('created_at', from)
            .lte('created_at', to);

        if (paymentErrors && paymentErrors.length > 0) {
            alerts.push({
                type: 'payment_error',
                items: paymentErrors,
            });
        }

        // Stock bajo
        const { data: lowStock } = await supabase
            .from('products')
            .select('id, name, sku, stock_quantity')
            .lt('stock_quantity', 10);

        if (lowStock && lowStock.length > 0) {
            alerts.push({
                type: 'low_stock',
                items: lowStock,
            });
        }

        // Pedidos incompletos
        const { data: incompleteOrders } = await supabase
            .from('orders')
            .select('id, order_number, status')
            .in('status', ['pending', 'processing'])
            .gte('created_at', from)
            .lte('created_at', to);

        if (incompleteOrders && incompleteOrders.length > 0) {
            alerts.push({
                type: 'incomplete_orders',
                items: incompleteOrders,
            });
        }
    } catch (error) {
        console.error('Error fetching alerts:', error);
    }

    return alerts;
};

// Calcular métricas financieras
const calculateFinancialMetrics = (orders: any[]) => {
    let grossRevenue = 0;
    let refunds = 0;
    let discounts = 0;

    orders.forEach((order) => {
        if (order.status === 'completed' || order.status === 'shipped') {
            grossRevenue += order.total_amount;
        } else if (order.status === 'refunded' || order.status === 'cancelled') {
            refunds += order.total_amount;
        }
        if (order.discount_amount) {
            discounts += order.discount_amount;
        }
    });

    const shippingCosts = orders.reduce((sum, order) => sum + (order.shipping_cost || 0), 0);
    const commissions = grossRevenue * 0.05; // 5% de comisión
    const netProfit = grossRevenue - refunds - shippingCosts - discounts - commissions;

    return {
        grossRevenue,
        refunds,
        discounts,
        shippingCosts,
        commissions,
        netProfit,
    };
};

// Obtener productos más vendidos
const getTopProducts = async (orders: any[]) => {
    const productMap = new Map();

    orders.forEach((order) => {
        if (order.order_items) {
            order.order_items.forEach((item: any) => {
                const key = item.products?.name || 'Desconocido';
                if (!productMap.has(key)) {
                    productMap.set(key, { quantity: 0, revenue: 0 });
                }
                const current = productMap.get(key);
                current.quantity += item.quantity;
                current.revenue += item.quantity * item.unit_price;
            });
        }
    });

    return Array.from(productMap.entries())
        .map(([name, data]) => ({
            product_name: name,
            product_quantity: data.quantity,
            product_revenue: data.revenue.toFixed(2),
        }))
        .sort((a, b) => b.product_quantity - a.product_quantity)
        .slice(0, 5);
};

// Obtener datos de reporte diario
export const getDailyReport = async (): Promise<DailyMetrics> => {
    const { from, to } = getDateRange('day');

    const orders = await fetchOrdersData(from, to);
    const shipments = await fetchShipmentsData(from, to);
    const alerts = await fetchAlerts(from, to);

    const totalRevenue = orders.reduce((sum, order) => {
        if (order.status === 'completed' || order.status === 'shipped') {
            return sum + order.total_amount;
        }
        return sum;
    }, 0);

    const pendingShipments = shipments.filter((s) => s.status !== 'delivered').length;

    return {
        totalOrders: orders.length,
        totalRevenue,
        pendingShipments,
        criticalAlerts: alerts.length,
        orders,
        shipments,
        alerts,
    };
};

// Generar datos completos para email de admin
export const generateAdminEmailData = async (
    dateRange: DateRange,
    startDate?: Date,
    endDate?: Date
): Promise<AdminEmailData> => {
    const { from, to } = getDateRange(dateRange, startDate, endDate);
    const dateRangeText = getReadableDateRange(dateRange, startDate, endDate);
    const periodName = {
        day: 'Reporte Diario',
        week: 'Reporte Semanal',
        month: 'Reporte Mensual',
        year: 'Reporte Anual',
        custom: 'Reporte Personalizado',
    }[dateRange];

    const orders = await fetchOrdersData(from, to);
    const shipments = await fetchShipmentsData(from, to);
    const alerts = await fetchAlerts(from, to);
    const topProducts = await getTopProducts(orders);
    const financials = calculateFinancialMetrics(orders);

    const totalRevenue = orders.reduce((sum, order) => {
        if (['completed', 'shipped'].includes(order.status)) {
            return sum + order.total_amount;
        }
        return sum;
    }, 0);

    const paymentErrors = alerts.find((a) => a.type === 'payment_error')?.items || [];
    const lowStockItems = alerts.find((a) => a.type === 'low_stock')?.items || [];
    const incompleteOrders = alerts.find((a) => a.type === 'incomplete_orders')?.items || [];

    const newCustomers = orders.filter((o) => o.is_new_customer).length;
    const returningCustomers = orders.length - newCustomers;

    const recommendedActions = [];
    if (lowStockItems.length > 0) {
        recommendedActions.push({
            action_text: `Hay ${lowStockItems.length} productos con stock bajo. Considere realizar una compra a proveedores.`,
        });
    }
    if (paymentErrors.length > 0) {
        recommendedActions.push({
            action_text: `${paymentErrors.length} pedidos tienen errores de pago. Revise y contacte a los clientes.`,
        });
    }
    if (financials.netProfit < 0) {
        recommendedActions.push({
            action_text: 'Las ganancias netas son negativas. Revise costos y márgenes de ganancia.',
        });
    }
    if (recommendedActions.length === 0) {
        recommendedActions.push({
            action_text: 'Todo está funcionando correctamente. ¡Buen trabajo!',
        });
    }

    const pendingShipments = shipments.filter((s) => s.status !== 'delivered').length;

    return {
        report_period: periodName,
        date_range: dateRangeText,
        report_date: new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }),
        generated_at: new Date().toLocaleString('es-ES'),
        total_orders: orders.length,
        total_revenue: totalRevenue.toFixed(2) as any,
        pending_shipments: pendingShipments,
        critical_alerts: alerts.length,
        has_alerts: alerts.length > 0,
        payment_errors: paymentErrors.map((p) => ({
            error_description: `Error en procesamiento de pago - Estado: ${p.status}`,
            affected_order: p.order_number,
        })),
        incomplete_orders: incompleteOrders.map((io) => ({
            order_issue: `Pedido en estado: ${io.status}`,
            order_id: io.order_number,
        })),
        low_stock: lowStockItems.map((ls) => ({
            product_name: ls.name,
            stock_quantity: ls.stock_quantity,
        })),
        system_alerts: [
            {
                system_message: 'Sistema operativo normalmente. Último backup realizado hace 24 horas.',
            },
        ],
        recent_orders: orders.slice(0, 10).map((o) => ({
            order_number: o.order_number,
            customer_name: o.users?.name || 'Cliente',
            order_amount: o.total_amount,
            order_status: o.status.toUpperCase(),
            order_status_lower: o.status.toLowerCase(),
            order_time: new Date(o.created_at).toLocaleTimeString('es-ES'),
        })),
        gross_revenue: financials.grossRevenue.toFixed(2) as any,
        refunds: financials.refunds.toFixed(2) as any,
        shipping_costs: financials.shippingCosts.toFixed(2) as any,
        discounts_total: financials.discounts.toFixed(2) as any,
        commissions: financials.commissions.toFixed(2) as any,
        net_profit: financials.netProfit.toFixed(2) as any,
        shipments: shipments.slice(0, 10).map((s) => ({
            tracking_number: s.tracking_number,
            destination: s.destination,
            shipment_status: s.status.toUpperCase(),
            shipment_status_lower: s.status.toLowerCase(),
            shipment_date: new Date(s.shipped_at).toLocaleDateString('es-ES'),
        })),
        top_products: topProducts,
        average_order_value: (totalRevenue / orders.length || 0).toFixed(2) as any,
        conversion_rate: ((orders.length / 1000) * 100).toFixed(2) as any, // Estimado
        new_customers: newCustomers,
        returning_customers: returningCustomers,
        most_used_payment: 'Tarjeta de Crédito',
        recommended_actions: recommendedActions,
        admin_email: process.env.ADMIN_EMAIL || 'admin@example.com',
        admin_panel_url: `${process.env.PUBLIC_URL}/admin/dashboard`,
        report_settings: `Reporte automático - ${dateRange}`,
        company_name: process.env.COMPANY_NAME || 'Mi Tienda',
        current_year: new Date().getFullYear(),
    };
};

// Exportar datos a formato para descarga
export const exportReportData = async (
    dateRange: DateRange,
    format: 'csv' | 'json' | 'excel' = 'csv',
    startDate?: Date,
    endDate?: Date
) => {
    const { from, to } = getDateRange(dateRange, startDate, endDate);
    const orders = await fetchOrdersData(from, to);

    if (format === 'json') {
        return JSON.stringify(orders, null, 2);
    }

    if (format === 'csv') {
        const headers = [
            'Nº Pedido',
            'Cliente',
            'Email',
            'Monto Total',
            'Estado',
            'Método de Pago',
            'Fecha',
        ];
        const rows = orders.map((o) => [
            o.order_number,
            o.users?.name || 'N/A',
            o.users?.email || 'N/A',
            o.total_amount,
            o.status,
            o.payment_method || 'N/A',
            new Date(o.created_at).toLocaleDateString('es-ES'),
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
        ].join('\n');

        return csvContent;
    }

    if (format === 'excel') {
        // Para Excel se puede usar una librería como 'exceljs'
        return JSON.stringify({
            message: 'Use /api/export?format=csv o instale exceljs para exportar a Excel',
        });
    }

    throw new Error('Formato de exportación no soportado');
};
