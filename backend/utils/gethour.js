export const convertTo24Hour = (timeStr) => {

    timeStr = timeStr.trim().toLowerCase();

    // Handles inputs like "3 AM", "3PM", "15", "15:00", etc.
    timeStr = timeStr.replace(/\s+/g, '').replace(/\./g, '')

    const parsed = Date.parse(`1970-01-01T${timeStr}`)

    if (!isNaN(parsed)) {
        const date = new Date(parsed)
        return date.getHours() + date.getMinutes() / 60;
    }

    // Manual fallback (for cases like "3am", "3 pm", "3p.m.")
    const match = timeStr.match(/^(\d{1,2})(?::(\d{2}))?(am|pm)?$/i);
    if (!match) return null;

    let hour = parseInt(match[1], 10);
    let minute = match[2] ? parseInt(match[2], 10) : 0;
    const period = match[3]?.toLowerCase();

    if (period === 'pm' && hour < 12) hour += 12;
    if (period === 'am' && hour === 12) hour = 0;

    return hour+minute / 60;
}
