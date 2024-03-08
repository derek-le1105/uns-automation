import { add, sub } from "date-fns";

export function getWholesaleDates(friday2 = new Date(), friday1 = new Date()) {
  var wed1 = new Date(), //most recent Wednesday
    wed2 = new Date(), //earliest Wednesday
    day = new Date().getDay();
  var wednesdayDiff = day <= 3 ? 7 - 3 + day : day - 3;
  // day: "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"
  wed1.setDate(wed1.getDate() - wednesdayDiff);
  wed2.setDate(wed2.getDate() - wednesdayDiff + 7);

  friday2 = add(wed1, { days: 2 });
  friday1 = sub(wed1, { days: 12 });

  return [friday2, friday1, wed2];
}
