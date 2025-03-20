import multer from "multer";

// Sử dụng memoryStorage để giữ file trong bộ nhớ (file.buffer)
const storage = multer.memoryStorage();

const upload = multer({ storage });

export default upload;