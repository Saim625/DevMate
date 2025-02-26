const validator = require("validator");

const validateSignUp = (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  if (!firstName || !lastName) {
    throw new Error("Enter valid name");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email is not valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Enter strong password");
  }
};

const validateProfileEdit = (req) => {
  const allowedFieldEdit = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "about",
    "imageURL",
    "skills",
  ];
  const isAllowed = Object.keys(req.body).every((f) =>
    allowedFieldEdit.includes(f)
  );
  return isAllowed;
};

module.exports = {
  validateSignUp,
  validateProfileEdit,
};
