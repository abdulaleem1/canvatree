/**
 * Contains reusable helper methods
 *
 * @class Helper
 */

class Helper {
  /**
   * Calculates distance between 2 points
   *
   * @param {Number} x1 - x1 co-ordinate of a point
   * @param {Number} y1 - y1 co-ordinate of a point
   * @param {Number} x2 - x2 co-ordinate of a point
   * @param {Number} y2 - y2 co-ordinate of a point
   */
  static distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  }

  /**
   * returns the max value(value of a specific property) from an object array
   *
   * @param {Object[]} arr - Input array
   * @param {String} by - Property which contains to value
   *
   * @returns {Number} - Max value
   */
  static maxValueBy(arr, by) {
    return Math.max.apply(
      Math,
      arr.map(function (o) {
        return o[by];
      })
    );
  }
  /**
   * returns the min value(value of a specific property) from an object array
   *
   * @param {Object[]} arr - Input array
   * @param {String} by - Property which contains to value
   *
   * @returns {Number} - Min value
   */
  static minValueBy(arr, by) {
    return Math.min.apply(
      Math,
      arr.map(function (o) {
        return o[by];
      })
    );
  }
  /**
   * returns the object with max value(value of a specific property) from an object array
   *
   * @param {Object[]} arr - Input array
   * @param {String} by - Property which contains to value
   *
   * @returns {Object} - Object with max value
   */
  static maxObjectBy(arr, by) {
    return arr.reduce((seed, item) => {
      return seed && seed[by] > item[by] ? seed : item;
    }, null);
  }
  /**
   * returns the object with min value(value of a specific property) from an object array
   *
   * @param {Object[]} arr - Input array
   * @param {String} by - Property which contains to value
   *
   * @returns {Object} - Object with min value
   */
  static minObjectBy(arr, by) {
    return arr.reduce((seed, item) => {
      return seed && seed[by] < item[by] ? seed : item;
    }, null);
  }
}

export default Helper;
