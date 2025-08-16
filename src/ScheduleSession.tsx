import { ActionPanel, Action, Form, showToast, Toast, popToRoot, open } from "@raycast/api";
import { useState } from "react";

interface ScheduleSessionProps {
  onSessionCreated?: () => void;
}

export function ScheduleSession({ onSessionCreated }: ScheduleSessionProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Smart default datetime: nearest 15-minute interval that's no more than 5 minutes earlier
  const getSmartStartDateTime = () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    // Find the nearest 15-minute interval
    let nearestInterval = Math.round(currentMinutes / 15) * 15;
    
    // If the nearest interval is more than 5 minutes earlier, use the next interval
    if (nearestInterval < currentMinutes - 5) {
      nearestInterval += 15;
    }
    
    // Convert back to hours and minutes
    const hours = Math.floor(nearestInterval / 60) % 24;
    const minutes = nearestInterval % 60;
    
    // Create a new date with the smart time
    const smartDateTime = new Date();
    smartDateTime.setHours(hours, minutes, 0, 0);
    
    return smartDateTime;
  };
  
  const [startDateTime, setStartDateTime] = useState<Date>(getSmartStartDateTime());
  const [duration, setDuration] = useState<string>("50");

  const handleSubmit = async () => {
    if (!startDateTime) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Missing datetime",
        message: "Please select a start date and time",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Check if the time is in the future
      if (startDateTime <= new Date()) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Invalid time",
          message: "Session time must be in the future",
        });
        return;
      }

      const hours = startDateTime.getHours();
      const minutes = startDateTime.getMinutes();

      // FocusMate's API doesn't support creating sessions, so open the web app
      // Format the URL with the selected date and time for convenience
      const focusmateUrl = `https://app.focusmate.com/schedule?date=${startDateTime.toISOString().split('T')[0]}&time=${hours}:${minutes.toString().padStart(2, '0')}&duration=${duration}`;
      
      await open(focusmateUrl);
      
      await showToast({
        style: Toast.Style.Success,
        title: "Opening FocusMate",
        message: `FocusMate will open with your preferred time pre-filled: ${startDateTime.toLocaleDateString()} at ${startDateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      });

      popToRoot();
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to open FocusMate",
        message: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const durationOptions = [
    { value: "25", title: "25 minutes" },
    { value: "50", title: "50 minutes (recommended)" },
    { value: "75", title: "75 minutes" },
    { value: "120", title: "2 hours" },
  ];

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Schedule Session" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.DatePicker 
        id="startDateTime" 
        title="Start Date & Time" 
        value={startDateTime} 
        onChange={setStartDateTime} 
        min={new Date()}
        type="dateTime"
      />

      <Form.Dropdown id="duration" title="Duration" value={duration} onChange={setDuration}>
        {durationOptions.map((option) => (
          <Form.Dropdown.Item key={option.value} value={option.value} title={option.title} />
        ))}
      </Form.Dropdown>

      <Form.Separator />

      <Form.Description text="You can type natural language like 'tomorrow at 2pm' or 'next Friday at 10:30'. This will open FocusMate in your browser with your preferred time pre-filled. You can then finalize scheduling your session, which will be available for others to join or use as a solo focus session." />
    </Form>
  );
}
