import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "profilePhoto") {
      cb(null, "uploads/profiles");
    } else if (file.fieldname === "evidence") {
      cb(null, "uploads/disputes");
    } else if (file.fieldname === "paymentProof") {
      cb(null, "uploads/payments");
    } else {
      cb(null, "uploads/misc");
    }
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

export default upload;
