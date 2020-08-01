class Helper {
  static distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  }

  static maxValueBy(arr, by) {
    return Math.max.apply(
      Math,
      arr.map(function (o) {
        return o[by];
      })
    );
  }
  static minValueBy(arr, by) {
    return Math.min.apply(
      Math,
      arr.map(function (o) {
        return o[by];
      })
    );
  }
  static maxObjectBy(arr, by) {
    return arr.reduce((seed, item) => {
      return seed && seed[by] > item[by] ? seed : item;
    }, null);
  }
  static minObjectBy(arr, by) {
    return arr.reduce((seed, item) => {
      return seed && seed[by] < item[by] ? seed : item;
    }, null);
  }
}

export default Helper;
