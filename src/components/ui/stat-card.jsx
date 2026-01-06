import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function StatCard({
  label,
  value,
  Icon,
  layout = "center",
  bg = "from-white to-white",
  iconBg = "bg-[#D4AF37]/15",
  iconColor = "text-[#B8941F]",
  padding = "p-6 pt-8",
}) {
  if (layout === "row") {
    return (
      <Card className={`border-none shadow-lg bg-gradient-to-br ${bg}`}>
        <CardContent className={`px-6 ${padding} pb-6`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">{label}</p>
              <p className="text-2xl font-black text-[#1A1A1A]">{value}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-none shadow-md bg-gradient-to-b ${bg}`}>
      <CardContent className={`${padding} text-center`}>
        <div className={`w-12 h-12 mx-auto mb-3 rounded-full ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <p className="text-2xl font-black">{value}</p>
        <p className="text-xs text-gray-600 mt-2">{label}</p>
      </CardContent>
    </Card>
  );
}
