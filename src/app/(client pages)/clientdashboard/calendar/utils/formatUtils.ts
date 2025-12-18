export const formatTimeDisplay = (timeString: string): string => {
  if (!timeString) return "زمان نامشخص";
  
  if (timeString.includes(':')) {
    const parts = timeString.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
  }
  
  return timeString;
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'text-emerald-400';
    case 'cancelled': return 'text-red-400';
    case 'done': return 'text-blue-400';
    default: return 'text-gray-400';
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return 'فعال';
    case 'cancelled': return 'کنسل شده';
    case 'done': return 'انجام شده';
    default: return 'نامشخص';
  }
};