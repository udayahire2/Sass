import { Users, FileText, Download, Star } from "lucide-react";

const stats = [
  {
    label: "Students Enrolled",
    value: "10,000+",
    icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    label: "Resources Available",
    value: "500+",
    icon: FileText,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    label: "Downloads",
    value: "50K+",
    icon: Download,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    label: "User Rating",
    value: "4.8/5",
    icon: Star,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
];

interface StatsSectionProps {
  compact?: boolean;
}

export function StatsSection({ compact = false }: StatsSectionProps) {
  if (compact) {
    return (
      <section className="container mx-auto py-4 px-4">
        <div className="grid grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <h3 className="text-xl font-bold tracking-tight text-foreground">
                {stat.value}
              </h3>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto py-12 px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center p-4"
          >
            <div
              className={`p-3 rounded-full ${stat.bg} mb-4 bg-opacity-50`}
            >
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 text-foreground">
              {stat.value}
            </h3>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
