import { add, sub } from "date-fns";

export function getWholesaleDates() {
  var day = new Date().getDay(),
    shipoutDate = new Date();
  if (day < 5 || (day === 5 && new Date().getHours() < 16)) {
    shipoutDate =
      day <= 3
        ? add(add(shipoutDate, { days: 7 }), { days: 3 - day })
        : sub(add(shipoutDate, { days: 7 }), {
            days: day - 3,
          });
  } else {
    shipoutDate = sub(add(shipoutDate, { days: 14 }), {
      days: day - 3,
    });
  }
  let date1 = sub(new Date(shipoutDate).setHours(16, 0, 0), { days: 12 });
  shipoutDate =
    sessionStorage.getItem("shipout_date") === null
      ? shipoutDate
      : new Date(sessionStorage.getItem("shipout_date"));
  return [date1, shipoutDate];
}
