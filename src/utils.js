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
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
    }).format(amount);
};
export const getYearRange = (startYear = 2023) => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = startYear; y <= currentYear + 1; y++) {
        years.push(y);
    }
    return years.sort((a, b) => b - a); // Return years in descending order (latest first)
};
