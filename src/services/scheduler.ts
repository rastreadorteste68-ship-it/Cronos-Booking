import { Professional, Appointment, AvailabilityRule, AvailabilityException } from '../types';
import { isSameDay, parse, format, addMinutes, isWithinInterval, parseISO, getDay, setHours, setMinutes, isBefore } from 'date-fns';

export const SchedulerService = {
  
  isWorkDay: (date: Date, professional: Professional): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // 1. Check Exceptions first
    const exception = professional.exceptions?.find(e => e.date === dateStr);
    if (exception) {
      return exception.active;
    }

    // 2. Check Weekly Availability
    const dayOfWeek = getDay(date); // 0 = Sunday
    const rule = professional.availability.find(r => r.dayOfWeek === dayOfWeek);
    return rule ? rule.active : false;
  },

  getWorkingHours: (date: Date, professional: Professional) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const exception = professional.exceptions?.find(e => e.date === dateStr);
    
    if (exception && exception.active) {
      return { start: exception.start || '09:00', end: exception.end || '18:00', breakStart: null, breakEnd: null };
    }

    const dayOfWeek = getDay(date);
    const rule = professional.availability.find(r => r.dayOfWeek === dayOfWeek);
    
    if (rule && rule.active) {
      return { start: rule.start, end: rule.end, breakStart: rule.breakStart, breakEnd: rule.breakEnd };
    }
    
    return null;
  },

  generateSlots: (dateStr: string, professional: Professional, dayAppointments: Appointment[]): string[] => {
    const date = parse(dateStr, 'yyyy-MM-dd', new Date());
    const hours = SchedulerService.getWorkingHours(date, professional);
    
    if (!hours) return [];

    const slots: string[] = [];
    const interval = professional.slotInterval || 60; // Default 60 min if not set

    let current = parse(hours.start, 'HH:mm', date);
    const end = parse(hours.end, 'HH:mm', date);
    
    // Parse breaks if they exist
    let breakStart = hours.breakStart ? parse(hours.breakStart, 'HH:mm', date) : null;
    let breakEnd = hours.breakEnd ? parse(hours.breakEnd, 'HH:mm', date) : null;

    while (isBefore(current, end)) {
      const slotEnd = addMinutes(current, interval);
      
      // Stop if slot exceeds work hours
      if (isBefore(end, slotEnd) && slotEnd.getTime() !== end.getTime()) break;

      // Check if inside break
      let inBreak = false;
      if (breakStart && breakEnd) {
        // If the slot overlaps with the break
        // Logic: Slot Start is before Break End AND Slot End is after Break Start
        if (isBefore(current, breakEnd) && isBefore(breakStart, slotEnd)) {
          inBreak = true;
        }
      }

      // Check if overlaps with existing appointments
      let isTaken = false;
      if (!inBreak) {
        const slotStartStr = format(current, 'HH:mm');
        const slotEndStr = format(slotEnd, 'HH:mm');

        isTaken = dayAppointments.some(appt => {
           if (appt.status === 'CANCELLED') return false;
           // Simple string comparison for HH:mm works because format is fixed
           return (appt.startTime < slotEndStr && appt.endTime > slotStartStr);
        });
      }

      if (!inBreak && !isTaken) {
        slots.push(format(current, 'HH:mm'));
      }

      current = addMinutes(current, interval);
    }

    return slots;
  }
};