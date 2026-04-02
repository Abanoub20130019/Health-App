import { format, startOfWeek, addDays, subDays, parseISO } from 'date-fns';

export const formatDate = (date: Date | string, pattern = 'yyyy-MM-dd') => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern);
};

export const formatDisplayDate = (date: Date | string) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'EEE, MMM d');
};

export const formatTime = (date: Date | string) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'h:mm a');
};

export const getToday = () => formatDate(new Date());

export const getWeekStart = (date: Date | string = new Date()) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDate(startOfWeek(d, { weekStartsOn: 1 })); // Monday start
};

export const getWeekDates = (weekStart: string): string[] => {
  const dates: string[] = [];
  const start = parseISO(weekStart);
  for (let i = 0; i < 7; i++) {
    dates.push(formatDate(addDays(start, i)));
  }
  return dates;
};

export const getCurrentMonth = () => formatDate(new Date(), 'yyyy-MM');

export const isToday = (date: string) => date === getToday();

export const getRelativeDate = (date: string): string => {
  const today = getToday();
  const yesterday = formatDate(subDays(new Date(), 1));
  
  if (date === today) return 'Today';
  if (date === yesterday) return 'Yesterday';
  return formatDisplayDate(date);
};

export const calculateDuration = (startTime: string, endTime: string): number => {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  return (end - start) / (1000 * 60 * 60); // hours
};
