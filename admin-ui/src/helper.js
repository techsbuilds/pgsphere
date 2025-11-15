export const formatDate= (timestamp) => {
    const date = new Date(timestamp);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    
    return `${day}, ${month} ${year}`;
}


export const capitalise = (str) =>{
    if(!str) return 

    return str.charAt(0).toUpperCase() + str.slice(1)
}

export const errorNameConvertor = (val) =>{
     const word = val.split("_")
    return word.map((char)=> char.charAt(0).toUpperCase() + char.slice(1)).join(" ")
}

export const sliceString = (str,n) =>{
    if(!str) return '-'
    if(str.length > n){
        return str.slice(0,n)+'...'
    }else{
        return str
    }
}

export const getShortMonthName = (monthNumber) =>{
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if (monthNumber < 1 || monthNumber > 12) return null;
    return monthNames[monthNumber - 1];
}

export const convertIntoRupees = (amount) =>{
    if(amount===null || amount === undefined) return ''

    if(amount < 0){
        let pos = Math.abs(amount)
        return "-₹"+pos
    }else{
        return "₹"+amount
    }
}

export const getShortName = (name) => {
    if(!name) return '' 
    
    return name.split(' ').map(ch => ch.charAt(0).toUpperCase()).join('')
}

export const parseTime = (timeStr) => {
    if (!timeStr) return { hour: '08', minute: '00', period: 'AM' }; // fallback

    // Convert to uppercase for safety
    const str = timeStr.toUpperCase().trim();

    // Extract period (AM/PM)
    const period = str.includes('AM') ? 'AM' : 'PM';

    // Remove period from string
    const timeWithoutPeriod = str.replace(/AM|PM/, '').trim();

    // Split hours/minutes
    let [hour, minute] = timeWithoutPeriod.split(':');

    if (!minute) minute = '00';

    // Pad with zero if needed
    hour = hour.padStart(2, '0');
    minute = minute.padStart(2, '0');

    return { hour, minute, period };
  };


export const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
  
    const intervals = {
      year: 31536000,  // 365 days
      month: 2592000,  // 30 days
      day: 86400,      // 24 hours
      hour: 3600,      // 1 hour
      minute: 60,
    };
  
    if (seconds < intervals.minute) {
      return `${seconds} seconds ago`;
    } else if (seconds < intervals.hour) {
      const minutes = Math.floor(seconds / intervals.minute);
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    } else if (seconds < intervals.day) {
      const hours = Math.floor(seconds / intervals.hour);
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else if (seconds < intervals.month) {
      const days = Math.floor(seconds / intervals.day);
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    } else if (seconds < intervals.year) {
      const months = Math.floor(seconds / intervals.month);
      return `${months} month${months !== 1 ? "s" : ""} ago`;
    } else {
      const years = Math.floor(seconds / intervals.year);
      return `${years} year${years !== 1 ? "s" : ""} ago`;
    }
  }
  