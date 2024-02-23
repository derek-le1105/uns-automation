export function getWholesaleDates() {
  var friday2 = new Date(), //most recent Friday
    friday1 = new Date(), //earliest Friday
    wed1 = new Date(), //most recent Wednesday
    wed2 = new Date(), //earliest Wednesday
    day = new Date().getDay();
  var wednesdayDiff = day <= 3 ? 7 - 3 + day : day - 3;
  // day: "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"
  wed1.setDate(wed1.getDate() - wednesdayDiff);
  wed2.setDate(wed2.getDate() - wednesdayDiff + 7);
  friday2.setDate(wed1.getDate() + 2);
  friday2.setHours(0, 0, 0);
  friday1.setDate(wed1.getDate() - 5);
  friday1.setHours(0, 0, 0);

  //return wed2, friday1, and friday2
  return [
    toIsoString(friday2),
    toIsoString(friday1),
    toIsoString(wed2).slice(0, 10),
  ];
}

function toIsoString(date) {
  var pad = function (num) {
    return (num < 10 ? "0" : "") + num;
  };

  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate())
  );
}
