const { validationResult } = require("express-validator")

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    })
  }
  next()
}

const sanitizeInput = (req, res, next) => {
  // Remove any potential XSS attempts from string inputs
  const sanitizeString = (str) => {
    if (typeof str !== "string") return str
    return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
  }

  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        obj[key] = sanitizeString(obj[key])
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        sanitizeObject(obj[key])
      }
    }
  }

  if (req.body) {
    sanitizeObject(req.body)
  }

  next()
}

module.exports = { handleValidationErrors, sanitizeInput }
