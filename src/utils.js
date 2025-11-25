import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export const getCurrentMonthYear = () => {
    const now = new Date();
    return { month: now.getMonth(), year: now.getFullYear() };
};

export const filterByMonthYear = (data, month, year, dateField = 'date') => {
    return data.filter(item => {
        const d = new Date(item[dateField]);
        // If month is 'all', filter by year only
        if (month === 'all') {
            return d.getFullYear() === parseInt(year);
        }
        // Otherwise filter by both month and year
        return d.getMonth() === parseInt(month) && d.getFullYear() === parseInt(year);
    });
};

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};
