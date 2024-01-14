export function getWholesaleDates() {
  var d = new Date(), //most recent Friday
    d2 = new Date(), //earliest Friday
    d3 = new Date(), //most recent Wednesday
    day = d.getDay(),
    diff = day <= 5 ? 7 - 5 + day : day - 5;
  // day: "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"
  d.setDate(d.getDate() - diff);
  d.setHours(23, 59, 59);
  d2.setDate(d.getDate() - 7);
  d2.setHours(23, 59, 59);
  d3.setDate(d.getDate() + 5);
  return [toIsoString(d), toIsoString(d2), toIsoString(d3).slice(0, 10)];
}

function toIsoString(date) {
  var tzo = -date.getTimezoneOffset(),
    dif = tzo >= 0 ? "+" : "-",
    pad = function (num) {
      return (num < 10 ? "0" : "") + num;
    };

  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds()) +
    dif +
    pad(Math.floor(Math.abs(tzo) / 60)) +
    ":" +
    pad(Math.abs(tzo) % 60)
  );
}
