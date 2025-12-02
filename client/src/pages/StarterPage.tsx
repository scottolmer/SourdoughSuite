import { MobileLayout, MobileCard } from "@/components/mobile-layout";
import { ArrowRight, Beaker, Calendar, Thermometer, ClipboardCheck } from "lucide-react";

export function StarterPage() {
  const starterModules = [
    {
      id: 1,
      title: "Starter Quiz",
      description: "Find your perfect sourdough starter match",
      icon: Beaker,
      href: "/starter/quiz",
      color: "bg-amber-100 dark:bg-amber-950"
    },
    {
      id: 2,
      title: "Starter Maintenance",
      description: "Keep your starter healthy with personalized care advice",
      icon: Thermometer,
      href: "/starter/maintenance",
      color: "bg-yellow-100 dark:bg-yellow-950"
    },
    {
      id: 3,
      title: "Baking Journal",
      description: "Track and analyze your bread baking results",
      icon: ClipboardCheck,
      href: "/starter/baking-journal",
      color: "bg-indigo-100 dark:bg-indigo-950"
    },
    {
      id: 4,
      title: "Feeding Schedule",
      description: "Create and track your starter feeding schedule",
      icon: Calendar,
      href: "/starter/schedule",
      color: "bg-green-100 dark:bg-green-950"
    }
  ];

  return (
    <MobileLayout title="Sourdough Starter" showBackButton>
      <div className="space-y-6">
        <section className="rounded-lg bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-900 p-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Sourdough Starter</h1>
          <p className="text-muted-foreground mb-4">
            Everything you need for your sourdough starter journey
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Tools & Resources</h2>
          
          <div className="grid grid-cols-1 gap-4">
            {starterModules.map((module) => (
              <div key={module.id} onClick={() => window.location.href = module.href}>
                <MobileCard
                  className="h-full cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className={`${module.color} p-3 rounded-lg`}>
                      <module.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{module.title}</h3>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </MobileCard>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">About Sourdough Starters</h2>
          <div className="prose dark:prose-invert prose-sm">
            <p>
              A sourdough starter is a fermented mixture of flour and water containing wild yeast and beneficial bacteria. 
              It's the natural leavening agent that gives sourdough bread its distinctive flavor and texture.
            </p>
            <p>
              Each starter has its own unique character based on its origin, flour types, and care routine.
            </p>
          </div>
        </section>
      </div>
    </MobileLayout>
  );
}