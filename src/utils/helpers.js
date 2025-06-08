// src/utils/helpers.js

/**
 * Gets the abbreviation for a given mushroom variety name by looking it up
 * in the provided list of variety objects. Falls back to the first two letters
 * if the variety name is not found in the list.
 * @param {string} varietyName - The full name of the mushroom variety.
 * @param {Array<{name: string, abbr: string}>} availableVarieties - The array of variety objects.
 * @returns {string} A 2-letter uppercase abbreviation or '??' if input is invalid.
 */
export function getAbbreviation(variety) {
    const map = {
      "Blue Oyster": "BO",
      "White Oyster": "WO",
      "Grey Oyster": "GO",
      "Yellow Oyster": "YO",
      "Black Pearl": "BP",
      "King Oyster": "KO",
      "Lions Mane": "LM",
      "Shiitake": "SH",
      "Piopinno": "PP",
      "Maitake": "MT",
      "Reishi": "RE",
      "Turkey Tail": "TT"
    };
    // Use optional chaining in case variety is null/undefined
    return map[variety] || variety?.substring(0, 2).toUpperCase() || "??";
  }

  /**
   * Formats a date input (Date object or string) into "YYYY-MM-DD" format.
   * Handles potential timezone offsets to ensure the local date is represented.
   * @param {Date|string|null} dateInput - The date to format.
   * @returns {string} The date formatted as "YYYY-MM-DD", or an empty string if input is invalid.
   */
  export function formatDate(dateInput) {
      if (!dateInput) return ''; // Return empty if input is null, undefined, or empty string
      try {
          // Handle cases where dateInput might already be a Date object or various string formats
          const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

          // Check if the date object is valid after parsing
          if (isNaN(date.getTime())) {
             // If original input was a string that looked like YYYY-MM-DD, try parsing it directly
             if (typeof dateInput === 'string' && dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
                 const checkDate = new Date(dateInput + 'T00:00:00'); // Use T00:00:00 to ensure local date
                 if (!isNaN(checkDate.getTime())) return dateInput; // Return original if it was valid YYYY-MM-DD
             }
             // console.warn("Invalid date input for formatDate:", dateInput); // Keep commented unless debugging
             return ''; // Return empty for invalid dates
          }

          // Adjust for timezone offset to get the correct YYYY-MM-DD in the *local* timezone
          // This prevents the date from shifting back a day in some timezones
          const offset = date.getTimezoneOffset(); // Get offset in minutes
          const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000)); // Adjust time

          // Convert to ISO string and take the date part
          return adjustedDate.toISOString().split('T')[0];
      } catch (e) {
          // console.error("Error formatting date:", dateInput, e); // Keep commented unless debugging
          return ''; // Return empty string on error
      }
  }

  /**
   * Calculates the difference between two dates in days.
   * @param {string|null} date1Str - The first date string ("YYYY-MM-DD").
   * @param {string|null} date2Str - The second date string ("YYYY-MM-DD").
   * @returns {number|null} The difference in days, or null if inputs are invalid.
   */
  export function daysBetween(date1Str, date2Str) {
      if (!date1Str || !date2Str) return null; // Check for null/undefined inputs
      try {
          // Parse dates assuming local time by adding T00:00:00
          const date1 = new Date(date1Str + 'T00:00:00');
          const date2 = new Date(date2Str + 'T00:00:00');
          if (isNaN(date1.getTime()) || isNaN(date2.getTime())) return null; // Check for invalid dates

          // Calculate difference in milliseconds and convert to days
          const differenceMs = date2.getTime() - date1.getTime();
          return Math.round(differenceMs / (1000 * 60 * 60 * 24));
      } catch (e) {
          // console.error("Error calculating days between:", date1Str, date2Str, e); // Keep commented unless debugging
          return null; // Return null on error
      }
  }

  /**
   * Gets the financial year string (e.g., "FY24/25") for a given date string.
   * Assumes financial year starts on a specific month (default July).
   * @param {string|null} dateStr - The date string ("YYYY-MM-DD").
   * @param {number} [startMonth=6] - The starting month of the financial year (0-indexed, default is 6 for July).
   * @returns {string} The financial year string or "N/A", "Invalid Date", "Error".
   */
  export function getFinancialYear(dateStr, startMonth = 6) { // 0 = January, 6 = July
       if (!dateStr) return "N/A"; // Handle null/undefined date strings
       try {
          const date = new Date(dateStr + 'T00:00:00');
          if (isNaN(date.getTime())) return "Invalid Date";
          let year = date.getFullYear();
          const month = date.getMonth(); // 0-indexed (0 = Jan, 6 = Jul)

          let startYear, endYear;
          if (month >= startMonth) {
              startYear = year;
              endYear = year + 1;
          } else {
              startYear = year - 1;
              endYear = year;
          }
          // Return in format FYYY/YY
          return `FY${String(startYear).slice(-2)}/${String(endYear).slice(-2)}`;
      } catch (e) {
           // console.error("Error getting financial year:", dateStr, e); // Keep commented unless debugging
           return "Error";
      }
  }

  /**
   * Gets the start date of the week (Sunday) for a given date object or string.
   * @param {Date|string} date - The input date.
   * @returns {Date|null} The Date object representing the start of the week (Sunday), or null if input is invalid.
   */
  export function getStartOfWeek(date) {
      try {
          const d = new Date(date);
          if (isNaN(d.getTime())) return null; // Handle invalid date input
          const day = d.getDay(); // 0 = Sunday, 1 = Monday, ...
          const diff = d.getDate() - day; // Adjust date to Sunday
          return new Date(d.setDate(diff));
      } catch (e) {
          // console.error("Error getting start of week:", date, e); // Keep commented unless debugging
          return null;
      }
  }

/**
 * Recursively converts object keys from snake_case or kebab-case to camelCase.
 * Handles arrays and nested objects.
 * @param {any} obj - The object or array to process.
 * @returns {any} The object or array with camelCase keys.
 */
export function toCamelCase(obj) {
  if (Array.isArray(obj)) {
    return obj.map(v => toCamelCase(v));
  } else if (obj !== null && typeof obj === 'object' && obj.constructor === Object) { // Ensure it's a plain object
    return Object.keys(obj).reduce(
      (result, key) => {
        const camelCaseKey = key.replace(/([-_][a-z])/gi, (group) =>
          group.toUpperCase().replace('-', '').replace('_', '')
        );
        result[camelCaseKey] = toCamelCase(obj[key]);
        return result;
      },
      {}
    );
  }
  return obj;
}

/**
 * Recursively converts object keys from camelCase to snake_case.
 * Handles arrays and nested objects.
 * @param {any} obj - The object or array to process.
 * @returns {any} The object or array with snake_case keys.
 */
export function toSnakeCase(obj) {
  if (Array.isArray(obj)) {
    return obj.map(v => toSnakeCase(v));
  } else if (obj !== null && typeof obj === 'object' && obj.constructor === Object) { // Ensure it's a plain object
    return Object.keys(obj).reduce(
      (result, key) => {
        // Handles cases like 'batchID' -> 'batch_id' and 'someURL' -> 'some_url'
        const snakeCaseKey = key.replace(/[A-Z]/g, (letter, index) => {
            // If the uppercase letter is not the first character and the preceding character is not already an underscore or uppercase (to avoid double underscores for acronyms like URL)
            return (index !== 0 && key[index-1] !== '_' && key[index-1] !== key[index-1].toUpperCase()) ? `_${letter.toLowerCase()}` : letter.toLowerCase();
        });
        result[snakeCaseKey] = toSnakeCase(obj[key]);
        return result;
      },
      {}
    );
  }
  return obj;
}
