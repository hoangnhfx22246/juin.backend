/**
 * Hàm phân trang dùng chung cho tất cả model, trả về format chuẩn cho frontend.
 * @param {mongoose.Model} model - Model MongoDB.
 * @param {Object} query - Điều kiện lọc.
 * @param {Object|String} populate - Populate field nếu có.
 * @param {Number} page - Trang hiện tại.
 * @param {Number} limit - Số lượng mỗi trang.
 * @param {Object} sort - sắp xếp theo trường nào.
 * @returns {Object} - Object gồm categories (hoặc data) và pagination.
 */
async function paginate(
  model,
  query = {},
  populate = "",
  page = 1,
  limit = 10,
  sort = {}
) {
  const skip = (page - 1) * limit;
  const totalItems = await model.countDocuments(query);

  let dataQuery = model.find(query).sort(sort).skip(skip).limit(limit);

  if (populate) {
    dataQuery = dataQuery.populate(populate);
  }

  const data = await dataQuery;

  return {
    data,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      itemsPerPage: limit,
    },
  };
}
module.exports = paginate;
