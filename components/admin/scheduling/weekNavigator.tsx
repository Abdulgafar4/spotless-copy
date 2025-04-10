import React from "react";
import { Button} from "@/components/ui/button"
import { ChevronLeft, ChevronRight} from "lucide-react"
import { addDays, format } from 'date-fns';

export const WeekNavigator = ({ 
    startDate, 
    onPrevWeek, 
    onNextWeek, 
    onToday 
  }: { 
    startDate: Date, 
    onPrevWeek: () => void, 
    onNextWeek: () => void, 
    onToday: () => void 
  }) => (
    <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPrevWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onNextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-medium ml-2 whitespace-nowrap">
          {format(startDate, "MMM d, yyyy")} - {format(addDays(startDate, 6), "MMM d, yyyy")}
        </h3>
      </div>
      <Button variant="outline" onClick={onToday}>
        Today
      </Button>
    </div>
  );
  