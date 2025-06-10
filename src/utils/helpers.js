// src/utils/helpers.js

/**
 * Gets the abbreviation for a given mushroom variety name by looking it up
 * in the provided list of variety objects. Falls back to the first two letters
 * if the variety name is not found in the list.
 * @param {string} varietyName - The full name of the mushroom variety.
 * @param {Array<{name: string, abbr: string}>} availableVarieties - The array of variety objects.
 * @returns {string} A 2-letter uppercase abbreviation or '??' if input is invalid.
 */
// KEPT: This version from Tobys-Branch is more dynamic and works with API data.
export function getAbbreviation(varietyName, availableVarieties = []) {
    if (!varietyName || !Array.isArray(availableVarieties)) {
        return "??";
    }
    const varietyObj = availableVarieties.find(v => v.name === varietyName);
    if (varietyObj && varietyObj.abbr) {
        return varietyObj.abbr.toUpperCase();
    } else {
        return varietyName.substring(0, 2).toUpperCase() || "??";
    }
}

/**
 * Formats a date input (Date object or string) into "YYYY-MM-DD" format.
 * @param {Date|string|null} dateInput - The date to format.
 * @returns {string} The date formatted as "YYYY-MM-DD", or an empty string if input is invalid.
 */
export function formatDate(dateInput) {
    if (!dateInput) return '';
    try {
        const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
        if (isNaN(date.getTime())) {
            if (typeof dateInput === 'string' && dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const checkDate = new Date(dateInput + 'T00:00:00');
                if (!isNaN(checkDate.getTime())) return dateInput;
            }
            return '';
        }
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
        return adjustedDate.toISOString().split('T')[0];
    } catch (e) {
        return '';
    }
}

/**
 * Calculates the difference between two dates in days.
 * @param {string|null} date1Str - The first date string ("YYYY-MM-DD").
 * @param {string|null} date2Str - The second date string ("YYYY-MM-DD").
 * @returns {number|null} The difference in days, or null if inputs are invalid.
 */
export function daysBetween(date1Str, date2Str) {
    if (!date1Str || !date2Str) return null;
    try {
        const date1 = new Date(date1Str + 'T00:00:00');
        const date2 = new Date(date2Str + 'T00:00:00');
        if (isNaN(date1.getTime()) || isNaN(date2.getTime())) return null;
        const differenceMs = date2.getTime() - date1.getTime();
        return Math.round(differenceMs / (1000 * 60 * 60 * 24));
    } catch (e) {
        return null;
    }
}

/**
 * Gets the financial year string (e.g., "FY24/25") for a given date string.
 * @param {string|null} dateStr - The date string ("YYYY-MM-DD").
 * @param {number} [startMonth=6] - The starting month of the financial year (0-indexed, default is 6 for July).
 * @returns {string} The financial year string or "N/A", "Invalid Date", "Error".
 */
export function getFinancialYear(dateStr, startMonth = 6) {
     if (!dateStr) return "N/A";
     try {
        const date = new Date(dateStr + 'T00:00:00');
        if (isNaN(date.getTime())) return "Invalid Date";
        let year = date.getFullYear();
        const month = date.getMonth();
        let startYear, endYear;
        if (month >= startMonth) {
            startYear = year;
            endYear = year + 1;
        } else {
            startYear = year - 1;
            endYear = year;
        }
        return `FY${String(startYear).slice(-2)}/${String(endYear).slice(-2)}`;
    } catch (e) {
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
        if (isNaN(d.getTime())) return null;
        const day = d.getDay();
        const diff = d.getDate() - day;
        return new Date(d.setDate(diff));
    } catch (e) {
        return null;
    }
}

/**
 * Recursively converts object keys from snake_case or kebab-case to camelCase.
 * Handles arrays and nested objects.
 * @param {any} obj - The object or array to process.
 * @returns {any} The object or array with camelCase keys.
 */
// ADDED: These two functions are essential for the API to work correctly.
export function toCamelCase(obj) {
  if (Array.isArray(obj)) {
    return obj.map(v => toCamelCase(v));
  } else if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
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
  } else if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => {
        const snakeCaseKey = key.replace(/[A-Z]/g, (letter, index) => {
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