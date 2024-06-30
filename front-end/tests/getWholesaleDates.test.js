import getWholesaleDates from "../src/helper/getWholesaleDates";
import dayjs from "dayjs";

describe("Testing days", () => {
  describe("Normal weekly basis", () => {
    test("Running Sunday", () => {
      const testing_day = dayjs("2024-06-30T16:09:10.279Z");
      expect(getWholesaleDates(testing_day)).toStrictEqual([
        "2024-06-28T23:00:00.000Z",
        "2024-07-10T16:09:10.279Z",
      ]);
    });
    test("Running Monday", () => {
      const testing_day = dayjs("2024-07-01T16:09:10.279Z");
      expect(getWholesaleDates(testing_day)).toStrictEqual([
        "2024-06-28T23:00:00.000Z",
        "2024-07-10T16:09:10.279Z",
      ]);
    });
    test("Running Tuesday", () => {
      const testing_day = dayjs("2024-07-02T16:09:10.279Z");
      expect(getWholesaleDates(testing_day)).toStrictEqual([
        "2024-06-28T23:00:00.000Z",
        "2024-07-10T16:09:10.279Z",
      ]);
    });
    test("Running Wednesday", () => {
      const testing_day = dayjs("2024-07-03T16:09:10.279Z");
      expect(getWholesaleDates(testing_day)).toStrictEqual([
        "2024-06-28T23:00:00.000Z",
        "2024-07-10T16:09:10.279Z",
      ]);
    });
    test("Running Thursday", () => {
      const testing_day = dayjs("2024-07-04T16:09:10.279Z");
      expect(getWholesaleDates(testing_day)).toStrictEqual([
        "2024-06-28T23:00:00.000Z",
        "2024-07-10T16:09:10.279Z",
      ]);
    });
    test("Running Friday", () => {
      const testing_day = dayjs("2024-07-05T16:09:10.279Z");
      expect(getWholesaleDates(testing_day)).toStrictEqual([
        "2024-06-28T23:00:00.000Z",
        "2024-07-10T16:09:10.279Z",
      ]);
    });
    test("Running Saturday", () => {
      const testing_day = dayjs("2024-07-06T16:09:10.279Z");
      expect(getWholesaleDates(testing_day)).toStrictEqual([
        "2024-07-05T23:00:00.000Z",
        "2024-07-17T16:09:10.279Z",
      ]);
    });
  });

  describe("Year changing", () => {
    test("Thursday", () => {
      const testing_day = dayjs("2023-12-28T17:18:08.483Z");
      expect(getWholesaleDates(testing_day)).toStrictEqual([
        "2023-12-23T00:00:00.000Z",
        "2024-01-03T17:18:08.483Z",
      ]);
    });
    test("Friday before 4 PM PST", () => {
      const testing_day = dayjs("2023-12-29T17:18:08.483Z");
      expect(getWholesaleDates(testing_day)).toStrictEqual([
        "2023-12-23T00:00:00.000Z",
        "2024-01-03T17:18:08.483Z",
      ]);
    });
    test("Friday after 4 PM PST", () => {
      const testing_day = dayjs("2023-12-30T00:18:08.483Z");
      expect(getWholesaleDates(testing_day)).toStrictEqual([
        "2023-12-30T00:00:00.000Z",
        "2024-01-11T00:18:08.483Z",
      ]);
    });
  });
});

describe("Testing times", () => {
  describe("Friday", () => {
    test("Before 4 PM PST", () => {
      const testing_day = dayjs("2024-07-05T16:09:10.279Z");
      expect(getWholesaleDates(testing_day)).toStrictEqual([
        "2024-06-28T23:00:00.000Z",
        "2024-07-10T16:09:10.279Z",
      ]);
    });
    test("After 4 PM PST", () => {
      const testing_day = dayjs("2024-07-05T23:09:10.279Z");
      expect(getWholesaleDates(testing_day)).toStrictEqual([
        "2024-07-05T23:00:00.000Z",
        "2024-07-17T23:09:10.279Z",
      ]);
    });
  });
});
