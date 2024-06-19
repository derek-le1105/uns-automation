/**
 *
 * @param {Array} data - List of objects where each key is a column header
 * @returns - Returns a formatted object condensed from data
 */

export const format_data = (data) => {
  let _ = {};
  data.forEach((pack) => {
    _[pack["Plant Pack"]] = Object.values(pack).filter(
      (plant) => plant !== pack["Plant Pack"]
    );
  });
  return _;
};

/**
 *
 * @param {Array} data - List that contains item packs
 * @param {Object} supabase_data - Object containing item pack names as key value
 * @returns - Returns boolean if a string is included in supabase_data
 */
export const pack_exists = (data, supabase_data) => {
  let formatted = format_data(supabase_data);

  for (let pack of data) {
    if (Object.keys(formatted).includes(pack)) return true;
  }

  return false;
};
