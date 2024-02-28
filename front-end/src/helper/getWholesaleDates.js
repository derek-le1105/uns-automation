export function getWholesaleDates() {
  var recent_friday = new Date(), //most recent Friday
    earliest_friday = new Date(), //earliest Friday
    recent_wed = new Date(), //most recent Wednesday
    earliest_wed = new Date(), //earliest Wednesday
    day = new Date().getDay();
  var wednesdayDiff = day <= 3 ? 7 - 3 + day : day - 3;
  // day: "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"
  recent_wed.setDate(recent_wed.getDate() - wednesdayDiff);
  earliest_wed.setDate(earliest_wed.getDate() - wednesdayDiff + 7);
  recent_friday.setDate(recent_wed.getDate() + 2);
  recent_friday.setHours(0, 0, 0);
  earliest_friday.setDate(recent_wed.getDate() - 5);
  earliest_friday.setHours(0, 0, 0);

  recent_friday = new Date();
  earliest_friday = new Date(2024, 1, 23);
  earliest_wed = new Date();

  return [recent_friday, earliest_friday, earliest_wed];
}
