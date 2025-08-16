import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

export default function AnalyticsCharts() {
  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ["/api/analytics/revenue"],
  });

  const { data: tripCategoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/analytics/trip-categories"],
  });

  // Extended revenue data for full year
  const extendedRevenueData = [
    { month: 'Jan', revenue: 25000 },
    { month: 'Fev', revenue: 30000 },
    { month: 'Mar', revenue: 35000 },
    { month: 'Abr', revenue: 32000 },
    { month: 'Mai', revenue: 42000 },
    { month: 'Jun', revenue: 38000 },
    { month: 'Jul', revenue: 45000 },
    { month: 'Ago', revenue: 48000 },
    { month: 'Set', revenue: 44000 },
    { month: 'Out', revenue: 52000 },
    { month: 'Nov', revenue: 49000 },
    { month: 'Dez', revenue: 55000 },
  ];

  const pieColors = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6'];

  const formatCurrency = (value: number) => {
    return `R$ ${(value / 1000)}k`;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (revenueLoading || categoriesLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[1, 2].map((i) => (
          <Card key={i} className="border border-gray-100">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Revenue Trend Chart */}
      <Card className="border border-gray-100">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Tendência de Receita</CardTitle>
          <Select defaultValue="monthly">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Mensal</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="daily">Diário</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={extendedRevenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tickFormatter={formatCurrency}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Receita']}
                  labelStyle={{ color: '#374151' }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Trip Categories Chart */}
      <Card className="border border-gray-100">
        <CardHeader>
          <CardTitle>Tipos de Viagem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={Array.isArray(tripCategoriesData) ? tripCategoriesData : [
                    { type: 'Carga Geral', count: 45, percentage: 45 },
                    { type: 'Mudanças', count: 25, percentage: 25 },
                    { type: 'Entrega Expressa', count: 20, percentage: 20 },
                    { type: 'Transporte de Veículos', count: 10, percentage: 10 },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="type"
                >
                  {(Array.isArray(tripCategoriesData) ? tripCategoriesData : [
                    { type: 'Carga Geral', count: 45, percentage: 45 },
                    { type: 'Mudanças', count: 25, percentage: 25 },
                    { type: 'Entrega Expressa', count: 20, percentage: 20 },
                    { type: 'Transporte de Veículos', count: 10, percentage: 10 },
                  ]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value} viagens`, name]}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
