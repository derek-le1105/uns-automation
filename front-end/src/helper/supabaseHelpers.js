export const format_data = (data) => {
  let _ = {};
  data.forEach((pack) => {
    _[pack["Plant Pack"]] = Object.values(pack).filter(
      (plant) => plant !== pack["Plant Pack"]
    );
  });
  return _;
};
