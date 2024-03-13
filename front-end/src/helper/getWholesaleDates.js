import { add, sub } from "date-fns";

export function getWholesaleDates() {
  var date1 = sub(new Date().setHours(16, 0, 0), { days: 14 }),
    day = new Date().getDay(),
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

  return [date1, shipoutDate];
}
