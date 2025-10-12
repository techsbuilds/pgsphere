export const convertTo24Hour = (timeStr) => {
    
    // Handles inputs like "3 AM", "3PM", "15", "15:00", etc.
    const date = new Date(`1970-01-01T${timeStr.replace(/\s/g, '')}`);

    if (!isNaN(date)) {
        return date.getHours();
    }

    // Manual fallback (for cases like "3am", "3 pm", "3p.m.")
    const match = timeStr.match(/(\d+)\s*(am|pm)?/i);
    if (!match) return null;

    let hour = parseInt(match[1], 10);
    const period = match[2]?.toLowerCase();

    if (period === 'pm' && hour < 12) hour += 12;
    if (period === 'am' && hour === 12) hour = 0;

    return hour;
}
