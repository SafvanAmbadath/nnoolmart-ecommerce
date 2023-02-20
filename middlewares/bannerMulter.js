const multer=require('multer')


const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/img/offer-banner");
    },
    filename: (req, file, cb) => {
      const ext = file.mimetype.split("/")[1];
      cb(null, `img-${file.fieldname}-${Date.now()}.${ext}`);
    },
  });
  const banner = multer({
    storage: multerStorage,
    // fileFilter: multerFilter,
  });
  module.exports=banner