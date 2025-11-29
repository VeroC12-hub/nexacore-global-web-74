import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Timer, Play, Pause, Square, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface ActiveTimer {
  id: string;
  project_title: string;
  task_title?: string;
  description: string;
  started_at: string;
  elapsed_seconds: number;
  hourly_rate: number;
}

interface ActiveTimerWidgetProps {
  activeTimers: ActiveTimer[];
  onStopTimer: (timerId: string, hours: number) => void;
}

export function ActiveTimerWidget({ activeTimers, onStopTimer }: ActiveTimerWidgetProps) {
  const [timers, setTimers] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    // Initialize timers with elapsed time
    const newTimers = new Map<string, number>();
    activeTimers.forEach(timer => {
      const startTime = new Date(timer.started_at).getTime();
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - startTime) / 1000);
      newTimers.set(timer.id, elapsedSeconds);
    });
    setTimers(newTimers);

    // Update timers every second
    const interval = setInterval(() => {
      setTimers(prev => {
        const updated = new Map(prev);
        activeTimers.forEach(timer => {
          const current = updated.get(timer.id) || 0;
          updated.set(timer.id, current + 1);
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimers]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStopTimer = (timer: ActiveTimer) => {
    const elapsedSeconds = timers.get(timer.id) || 0;
    const hours = Number((elapsedSeconds / 3600).toFixed(2));

    if (hours === 0) {
      toast.error('Timer must run for at least 1 minute');
      return;
    }

    onStopTimer(timer.id, hours);
  };

  if (activeTimers.length === 0) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Timer className="h-5 w-5 text-orange-600 animate-pulse" />
          Active Timers
          <Badge variant="destructive" className="ml-2">
            {activeTimers.length} Running
          </Badge>
        </CardTitle>
        <CardDescription>Currently tracking time</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeTimers.map(timer => {
          const elapsedSeconds = timers.get(timer.id) || 0;
          const currentHours = elapsedSeconds / 3600;
          const currentRevenue = currentHours * timer.hourly_rate;

          return (
            <div
              key={timer.id}
              className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200 shadow-sm"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-sm">{timer.project_title}</span>
                  {timer.task_title && (
                    <Badge variant="outline" className="text-xs">
                      {timer.task_title}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {timer.description}
                </p>
                <div className="flex items-center gap-4">
                  <div className="font-mono text-2xl font-bold text-orange-600">
                    {formatTime(elapsedSeconds)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div>${timer.hourly_rate}/hr</div>
                    <div className="font-semibold text-green-600">
                      ${currentRevenue.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleStopTimer(timer)}
                className="ml-4 flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                Stop
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
