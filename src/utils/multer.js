const multer = require("multer");

// Set the storage engine for Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${getFileExtension(file.originalname)}`
    );
  },
});

// Check the file type of the uploaded file
function checkFileType(file, cb) {
  const fileTypes = /jpeg|jpg|png/; // Allowed extensions
  const extname = fileTypes.test(
    getFileExtension(file.originalname).toLowerCase()
  );
  const mimetype = fileTypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Invalid file type. Only JPEG, JPG, PNG files are allowed.");
  }
}

// Function to get the file extension of the uploaded file
function getFileExtension(filename) {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
}

// Create the Multer middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB file size limit
  },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = upload;
