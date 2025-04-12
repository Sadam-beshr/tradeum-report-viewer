
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";

export type DateRangeOption = "24H" | "7D" | "30D" | "YTD" | "1Y" | "Custom";

interface TimeRangeSelectorProps {
  onRangeChange: (range: { start: Date; end: Date }) => void;
  selectedOption: DateRangeOption;
  setSelectedOption: (option: DateRangeOption) => void;
}

const TimeRangeSelector = ({
  onRangeChange,
  selectedOption,
  setSelectedOption,
}: TimeRangeSelectorProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleOptionClick = (option: DateRangeOption) => {
    setSelectedOption(option);
    const end = new Date();
    let start = new Date();

    switch (option) {
      case "24H":
        start.setDate(end.getDate() - 1);
        break;
      case "7D":
        start.setDate(end.getDate() - 7);
        break;
      case "30D":
        start.setDate(end.getDate() - 30);
        break;
      case "YTD":
        start = new Date(end.getFullYear(), 0, 1);
        break;
      case "1Y":
        start.setFullYear(end.getFullYear() - 1);
        break;
      case "Custom":
        setIsCalendarOpen(true);
        return;
    }

    onRangeChange({ start, end });
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      // When a date is selected, use it as both start and end date for simplicity
      onRangeChange({ start: selectedDate, end: selectedDate });
      setIsCalendarOpen(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center space-x-1 rounded-md bg-secondary p-1">
        {(["24H", "7D", "30D", "YTD", "1Y"] as DateRangeOption[]).map((option) => (
          <Button
            key={option}
            variant={selectedOption === option ? "default" : "ghost"}
            size="sm"
            onClick={() => handleOptionClick(option)}
            className={cn(
              "text-xs",
              selectedOption === option && "bg-primary text-primary-foreground"
            )}
          >
            {option}
          </Button>
        ))}
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={selectedOption === "Custom" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleOptionClick("Custom")}
              className={cn(
                "text-xs",
                selectedOption === "Custom" && "bg-primary text-primary-foreground"
              )}
            >
              Custom
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      {selectedOption === "Custom" && date && (
        <span className="text-sm text-muted-foreground">
          {format(date, "PPP")}
        </span>
      )}
    </div>
  );
};

export default TimeRangeSelector;
