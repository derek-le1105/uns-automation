import * as dayjs from "dayjs";
import * as utc from "dayjs/plugin/utc";
import * as timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("America/Los_Angeles");

export function getWholesaleDates() {
  var day = dayjs().day(),
    shipoutDate = dayjs();
  if (day < 5 || (day === 5 && dayjs().hour() < 16)) {
    shipoutDate =
      day <= 3
        ? shipoutDate.add(7, "d").add(3 - day, "d")
        : shipoutDate.add(7, "d").subtract(day - 3, "d");
  } else {
    shipoutDate.add(14, "d").subtract(day - 3, "d");
  }
  let date1 = shipoutDate
    .subtract(12, "d")
    .hour(16)
    .minute(0)
    .second(0)
    .millisecond(0);
  shipoutDate =
    sessionStorage.getItem("shipout_date") === null
      ? shipoutDate
      : dayjs(sessionStorage.getItem("shipout_date"));
  return [date1, shipoutDate];
}
