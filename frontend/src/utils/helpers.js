// Format date for display (Notion-style)
export const formatDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const dateToCheck = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  
  if (dateToCheck.getTime() === today.getTime()) {
    return 'Today';
  } else if (dateToCheck.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
};

// Format currency (₹ or $)
export const formatCurrency = (amount, currency = '₹') => {
  if (!amount && amount !== 0) return '';
  
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  
  return `${currency}${formattedAmount}`;
};

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const then = new Date(date);
  const diffInMs = now - then;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  } else {
    return formatDate(date);
  }
};

// Get status color
export const getStatusColor = (status) => {
  switch (status) {
    case 'todo':
      return 'text-gray-400';
    case 'in-progress':
      return 'text-yellow-400';
    case 'done':
      return 'text-green-400';
    default:
      return 'text-gray-400';
  }
};

// Get priority color
export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'low':
      return 'text-blue-400';
    case 'medium':
      return 'text-yellow-400';
    case 'high':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Generate initials from name
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Get file size string
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get file type icon
export const getFileIcon = (mimeType) => {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.includes('word')) return '📝';
  if (mimeType.includes('text/')) return '📄';
  return '📎';
};
