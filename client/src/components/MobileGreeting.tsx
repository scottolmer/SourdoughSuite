import { Sun, Moon, Cloud } from "lucide-react";

export function MobileGreeting() {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good morning!", icon: Sun, bg: "from-yellow-50 to-orange-50" };
    if (hour < 17) return { text: "Good afternoon!", icon: Sun, bg: "from-blue-50 to-indigo-50" };
    return { text: "Good evening!", icon: Moon, bg: "from-purple-50 to-pink-50" };
  };

  const greeting = getGreeting();
  const IconComponent = greeting.icon;

  return (
    <div className={`px-4 py-6 bg-gradient-to-r ${greeting.bg}`}>
      <div className="flex items-center gap-3 mb-2">
        <IconComponent className="h-6 w-6 text-gray-600" />
        <h2 className="text-2xl font-semibold text-gray-900">{greeting.text}</h2>
      </div>
      <p className="text-gray-600">Ready to explore bread science?</p>
    </div>
  );
}