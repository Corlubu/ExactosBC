import { createFileRoute } from "@tanstack/react-router";
import { Wrench, Calendar, ClipboardList, Package, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/app/maintenance/")({
  component: MaintenancePage,
});

function MaintenancePage() {
  const features = [
    {
      icon: Calendar,
      title: "Preventive Maintenance",
      description: "Schedule and track preventive maintenance tasks to reduce asset failures and extend useful life.",
      color: "from-green-500 to-green-600",
    },
    {
      icon: ClipboardList,
      title: "Work Orders",
      description: "Create, assign, and manage work orders for repairs and maintenance activities with priority tracking.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Package,
      title: "Parts & Costs",
      description: "Track spare parts usage and maintenance costs per asset for accurate TCO calculations.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: AlertCircle,
      title: "Maintenance Alerts",
      description: "Receive notifications for upcoming maintenance tasks and overdue work orders.",
      color: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-4">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Maintenance Module</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Comprehensive maintenance management to keep your assets running smoothly.
            This module will be fully implemented in the next phase.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Coming Soon Banner */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h2>
          <p className="text-gray-600 mb-6">
            The Maintenance module is currently under development. Full preventive maintenance
            scheduling, work order management, and parts tracking will be available soon.
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg">
            <Wrench className="w-5 h-5 mr-2" />
            In Development
          </div>
        </div>
      </div>
    </div>
  );
}
