import path from 'path';
import multer from 'multer';
import fs from 'fs';
import config from '../config';

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    if (!fs.existsSync(path.join(config.sessionDirectory, req.params.session, 'uploads'))) {
      fs.mkdirSync(path.join(config.sessionDirectory, req.params.session, 'uploads'), {
        recursive: true,
      });
    }
    callback(null, path.join(config.sessionDirectory, req.params.session, 'uploads'));
  },
  filename: function (req, file, callback) {
    let filename = `${Date.now()}-${file.originalname}`;
    callback(null, filename);
  },
});

const uploadUtil = multer({ storage: storage });
export default uploadUtil;
