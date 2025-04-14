const { validationResult } = require("express-validator");
const { validationErrorResponse } = require("../../utils/errorResponse");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationErrorResponse(res, errors.array());
  }
  next();
};

module.exports = validateRequest;
