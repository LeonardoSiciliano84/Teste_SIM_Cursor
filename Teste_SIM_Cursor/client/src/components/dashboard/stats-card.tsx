import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  iconColor: string;
  trend?: "up" | "down" | "neutral";
}

export default function StatsCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  iconColor, 
  trend = "neutral" 
}: StatsCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-success-600";
      case "down":
        return "text-error-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Card className="border border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {change && (
              <p className={`text-sm flex items-center mt-1 ${getTrendColor()}`}>
                {change}
              </p>
            )}
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconColor}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
