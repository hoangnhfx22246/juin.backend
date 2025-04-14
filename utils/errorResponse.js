// utils/errorResponse.js

// format lại lỗi từ express-validator
// thành định dạng dễ đọc hơn
function formatValidationErrors(errors) {
  const groupedErrors = Object.values(
    errors.reduce((acc, cur) => {
      if (!acc[cur.path]) {
        acc[cur.path] = { field: cur.path, messages: [] };
      }
      acc[cur.path].messages.push(cur.msg);
      return acc;
    }, {})
  );
  return groupedErrors;
}

// gửi phản hồi lỗi xác thực
function validationErrorResponse(res, errors) {
  return res.status(400).json({
    errors: formatValidationErrors(errors),
  });
}

// gửi phản hồi lỗi xung đột
// ví dụ: email đã tồn tại
function conflictErrorResponse(res, field, message) {
  return res.status(409).json({
    errors: [{ field, messages: [message] }],
  });
}

// gửi phản hồi lỗi máy chủ
function serverErrorResponse(
  res,
  message = "Có lỗi xảy ra, vui lòng thử lại."
) {
  return res.status(500).json({
    message,
  });
}

module.exports = {
  formatValidationErrors,
  validationErrorResponse,
  conflictErrorResponse,
  serverErrorResponse,
};
