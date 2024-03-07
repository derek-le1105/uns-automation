export const compareData = (obj1, obj2) => {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    const val1 = obj1[key];
    const val2 = obj2[key];
    const areObjects = isObject(val1) && isObject(val2);
    if (
      (areObjects && !compareData(val1, val2)) ||
      (!areObjects && val1 !== val2)
    ) {
      return false;
    }
  }

  return true;
};

function isObject(object) {
  return object != null && typeof object === "object";
}

export const objectUnion = (arr1, arr2) => {
  const combinedArray = [...arr1, ...arr2];

  // Use a Map to store unique objects based on their string representation
  const map = new Map(combinedArray.map((obj) => [JSON.stringify(obj), obj]));

  // Return the values from the Map as the union
  return Array.from(map.values());
};

export const isObjectIncluded = (new_data, compared_order) => {
  for (let order of new_data) {
    if (order.order_name === compared_order.order_name) {
      return true;
    }
  }
  return false;
};

export const objectLength = (data) => {
  let batch_length = 1,
    all_batches = [];
  for (let batch in data) {
    if (batch === "wednesday_date") continue;
    if (data[batch]) {
      all_batches = [...all_batches, ...data[batch]];
      batch_length += data[batch].length;
    }
  }

  return [batch_length, all_batches];
};
