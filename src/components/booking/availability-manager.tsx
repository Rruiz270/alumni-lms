'use client';

import { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface AvailabilitySlot {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const TIME_SLOTS = Array.from({ length: 24 * 2 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minute}`;
});

export function AvailabilityManager() {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const response = await fetch('/api/availability');
      if (response.ok) {
        const data = await response.json();
        setAvailability(data.availability || []);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSlot = () => {
    const newSlot: AvailabilitySlot = {
      dayOfWeek: 1, // Monday
      startTime: '09:00',
      endTime: '17:00',
      isActive: true,
    };
    setAvailability([...availability, newSlot]);
  };

  const updateSlot = (index: number, field: keyof AvailabilitySlot, value: any) => {
    const updated = [...availability];
    updated[index] = { ...updated[index], [field]: value };
    setAvailability(updated);
  };

  const removeSlot = (index: number) => {
    const updated = availability.filter((_, i) => i !== index);
    setAvailability(updated);
  };

  const saveAvailability = async () => {
    setSaving(true);
    try {
      // Validate slots
      const errors = [];
      for (let i = 0; i < availability.length; i++) {
        const slot = availability[i];
        if (slot.startTime >= slot.endTime) {
          errors.push(`Slot ${i + 1}: Start time must be before end time`);
        }
      }

      // Check for overlapping slots on same day
      const groupedByDay = availability.reduce((acc, slot, index) => {
        const key = slot.dayOfWeek;
        if (!acc[key]) acc[key] = [];
        acc[key].push({ ...slot, index });
        return acc;
      }, {} as Record<number, (AvailabilitySlot & { index: number })[]>);

      Object.entries(groupedByDay).forEach(([day, slots]) => {
        for (let i = 0; i < slots.length; i++) {
          for (let j = i + 1; j < slots.length; j++) {
            const slot1 = slots[i];
            const slot2 = slots[j];
            if (!(slot1.endTime <= slot2.startTime || slot1.startTime >= slot2.endTime)) {
              errors.push(
                `Overlapping slots on ${DAYS_OF_WEEK.find(d => d.value === parseInt(day))?.label}: ` +
                `${slot1.startTime}-${slot1.endTime} and ${slot2.startTime}-${slot2.endTime}`
              );
            }
          }
        }
      });

      if (errors.length > 0) {
        alert('Please fix the following issues:\n\n' + errors.join('\n'));
        return;
      }

      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(availability),
      });

      if (response.ok) {
        await fetchAvailability();
        alert('Availability saved successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error saving availability: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      alert('Error saving availability. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const clearAll = async () => {
    if (!confirm('Are you sure you want to clear all availability? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/availability', {
        method: 'DELETE',
      });

      if (response.ok) {
        setAvailability([]);
        alert('Availability cleared successfully!');
      }
    } catch (error) {
      console.error('Error clearing availability:', error);
      alert('Error clearing availability. Please try again.');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading availability...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Manage Availability
          </div>
          <div className="flex gap-2">
            <Button onClick={addSlot} size="sm" className="flex items-center gap-1">
              <Plus className="w-4 h-4" />
              Add Slot
            </Button>
            <Button
              onClick={saveAvailability}
              disabled={saving}
              size="sm"
              className="flex items-center gap-1"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {availability.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No availability slots configured</p>
            <p className="text-sm">Click "Add Slot" to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {availability.map((slot, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Slot {index + 1}</h4>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`active-${index}`} className="text-sm">
                      Active
                    </Label>
                    <Switch
                      id={`active-${index}`}
                      checked={slot.isActive}
                      onCheckedChange={(checked) => updateSlot(index, 'isActive', checked)}
                    />
                    <Button
                      onClick={() => removeSlot(index)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`day-${index}`} className="text-sm font-medium">
                      Day of Week
                    </Label>
                    <Select
                      value={slot.dayOfWeek.toString()}
                      onValueChange={(value) => updateSlot(index, 'dayOfWeek', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((day) => (
                          <SelectItem key={day.value} value={day.value.toString()}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`start-${index}`} className="text-sm font-medium">
                      Start Time
                    </Label>
                    <Select
                      value={slot.startTime}
                      onValueChange={(value) => updateSlot(index, 'startTime', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Start time" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`end-${index}`} className="text-sm font-medium">
                      End Time
                    </Label>
                    <Select
                      value={slot.endTime}
                      onValueChange={(value) => updateSlot(index, 'endTime', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="End time" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  {DAYS_OF_WEEK.find(d => d.value === slot.dayOfWeek)?.label} from {slot.startTime} to {slot.endTime}
                  {!slot.isActive && ' (Inactive)'}
                </div>
              </div>
            ))}
          </div>
        )}

        {availability.length > 0 && (
          <div className="flex justify-between pt-4 border-t">
            <Button
              onClick={clearAll}
              variant="outline"
              className="text-red-600 hover:text-red-700"
            >
              Clear All
            </Button>
            <div className="text-sm text-gray-500">
              {availability.filter(s => s.isActive).length} active slot(s)
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
          <h4 className="font-medium text-blue-900 mb-2">Tips:</h4>
          <ul className="text-blue-800 space-y-1">
            <li>• Students can book 60-minute classes during your available times</li>
            <li>• Time slots are shown in 30-minute intervals for booking flexibility</li>
            <li>• Inactive slots won't be shown to students for booking</li>
            <li>• Make sure to account for breaks between classes</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}