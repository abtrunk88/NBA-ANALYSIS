import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Bell, X } from "lucide-react";

export function AppUpdatesModal() {
  const [open, setOpen] = useState(false);

  const updates = [
    {
      version: "v1.7",
      title: "Expert Model Active",
      description: "Advanced AI predictions with enhanced fatigue analysis",
      features: [
        "Real-time game predictions",
        "Player absence impact analysis",
        "Fatigue and rest calculations",
        "Advanced shooting battle metrics",
      ],
      isActive: true,
    },
    {
      version: "v1.6",
      title: "Performance Analytics",
      description: "Comprehensive player and team statistics",
      features: ["Season stats integration", "Trend analysis", "Player projections"],
      isActive: false,
    },
  ];

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="relative hover:bg-primary/10"
      >
        <Bell className="h-5 w-5 text-primary" />
        <span className="absolute top-1 right-1 h-2 w-2 bg-accent rounded-full animate-pulse"></span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              NBA Data AI Updates
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {updates.map((update) => (
              <div
                key={update.version}
                className={`p-4 rounded-lg border-2 transition-all ${
                  update.isActive
                    ? "border-primary/50 bg-primary/5"
                    : "border-border bg-muted/30"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={update.isActive ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {update.version}
                      </Badge>
                      {update.isActive && (
                        <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30 text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground">
                      {update.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {update.description}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">
                    Features
                  </p>
                  <ul className="space-y-1">
                    {update.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <span className="text-primary mt-1">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={() => setOpen(false)}
            className="w-full"
            variant="default"
          >
            Got it
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
