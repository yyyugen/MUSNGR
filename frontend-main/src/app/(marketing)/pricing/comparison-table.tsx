import { Check } from "lucide-react";

const features = [
  {
    name: "Video Upload",
    description: "Upload videos to YouTube",
    free: true,
    pro: true,
    business: true,
  },
  {
    name: "Maximum video length",
    free: "15 minutes",
    pro: "1 hour",
    business: "Unlimited",
  },
  {
    name: "Monthly uploads",
    free: "5 videos",
    pro: "50 videos",
    business: "Unlimited",
  },
  {
    name: "4K Resolution",
    free: false,
    pro: true,
    business: true,
  },
  {
    name: "Scheduled uploads",
    free: false,
    pro: true,
    business: true,
  },
  {
    name: "Bulk upload",
    free: false,
    pro: false,
    business: true,
  },
  {
    name: "Analytics",
    free: "Basic",
    pro: "Advanced",
    business: "Enterprise",
  },
  {
    name: "Team members",
    free: "1",
    pro: "3",
    business: "Unlimited",
  },
];

export function ComparisonTable() {
  return (
    <div className="mt-16 overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="py-4 px-6 text-left text-sm font-normal text-gray-400">
              Features
            </th>
            <th className="py-4 px-6 text-left text-sm font-normal text-gray-400">
              Free
            </th>
            <th className="py-4 px-6 text-left text-sm font-normal text-gray-400">
              Pro
            </th>
            <th className="py-4 px-6 text-left text-sm font-normal text-gray-400">
              Business
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <tr key={index} className="border-b border-zinc-800">
              <td className="py-4 px-6 text-sm text-white">{feature.name}</td>
              <td className="py-4 px-6">
                {typeof feature.free === "boolean" ? (
                  feature.free ? (
                    <Check className="w-5 h-5 text-blue-500" />
                  ) : null
                ) : (
                  <span className="text-sm text-gray-400">{feature.free}</span>
                )}
              </td>
              <td className="py-4 px-6">
                {typeof feature.pro === "boolean" ? (
                  feature.pro ? (
                    <Check className="w-5 h-5 text-blue-500" />
                  ) : null
                ) : (
                  <span className="text-sm text-gray-400">{feature.pro}</span>
                )}
              </td>
              <td className="py-4 px-6">
                {typeof feature.business === "boolean" ? (
                  feature.business ? (
                    <Check className="w-5 h-5 text-blue-500" />
                  ) : null
                ) : (
                  <span className="text-sm text-gray-400">
                    {feature.business}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
