import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Lấy đường dẫn hiện tại trong ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: 'driwmi6q7',
  api_key: '831852351782775',
  api_secret: 'WP5amqv9AsH53z8BjZikkXrGirg'
});

// Đường dẫn đến thư mục assets
const ASSETS_FOLDER = path.join(__dirname, 'src', 'assets');
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];

// Hàm kiểm tra xem file có phải là ảnh không
function isImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

// Hàm tải một ảnh lên Cloudinary
async function uploadImage(filePath, publicId) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: publicId,
      resource_type: 'image'
    });
    return result.secure_url;
  } catch (error) {
    console.error(`Lỗi khi tải lên ảnh ${filePath}:`, error);
    return null;
  }
}

// Hàm chính để tải tất cả ảnh trong thư mục
async function uploadAllImages() {
  try {
    // Kiểm tra thư mục assets tồn tại
    if (!fs.existsSync(ASSETS_FOLDER)) {
      console.error(`Thư mục ${ASSETS_FOLDER} không tồn tại`);
      return;
    }

    // Đọc danh sách file trong thư mục
    const files = fs.readdirSync(ASSETS_FOLDER);
    const imageFiles = files.filter(file => isImage(path.join(ASSETS_FOLDER, file)));
    console.log(`Tìm thấy ${imageFiles.length} file ảnh trong thư mục assets`);

    // Tạo mapping giữa tên file và URL Cloudinary
    const imageMapping = {};
    let successCount = 0;
    let failCount = 0;

    // Lặp qua từng file và tải lên Cloudinary
    for (const file of imageFiles) {
      // Bỏ qua file react.svg (React logo)
      if (file === 'react.svg') continue;

      const filePath = path.join(ASSETS_FOLDER, file);
      const publicId = `ecommerce_assets/${path.parse(file).name}`;
      
      console.log(`Đang tải lên ${file}...`);
      const imageUrl = await uploadImage(filePath, publicId);
      
      if (imageUrl) {
        imageMapping[file] = imageUrl;
        successCount++;
        console.log(`✅ Tải lên thành công: ${file} -> ${imageUrl}`);
      } else {
        failCount++;
        console.log(`❌ Tải lên thất bại: ${file}`);
      }
      
      // Tạm dừng 1 giây để tránh quá tải API Cloudinary
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Lưu mapping ra file JSON
    const mappingFilePath = path.join(__dirname, 'cloudinary_mapping.json');
    fs.writeFileSync(mappingFilePath, JSON.stringify(imageMapping, null, 2));
    
    console.log(`\n===== KẾT QUẢ =====`);
    console.log(`Tổng số ảnh: ${imageFiles.length}`);
    console.log(`Tải lên thành công: ${successCount}`);
    console.log(`Tải lên thất bại: ${failCount}`);
    console.log(`File mapping đã được lưu tại: ${mappingFilePath}`);
    
    // Tạo mẫu file sản phẩm với URL Cloudinary
    createProductsWithCloudinaryUrls(imageMapping);
  } catch (error) {
    console.error('Lỗi khi tải ảnh lên Cloudinary:', error);
  }
}

// Hàm tạo file sản phẩm với URL Cloudinary
function createProductsWithCloudinaryUrls(imageMapping) {
  try {
    // Đọc file products.js hiện tại
    const productsFilePath = path.join(__dirname, 'products.js');
    if (!fs.existsSync(productsFilePath)) {
      console.error('Không tìm thấy file products.js');
      return;
    }

    const productsData = fs.readFileSync(productsFilePath, 'utf8');
    
    // Parse file để lấy dữ liệu sản phẩm
    let products;
    try {
      products = JSON.parse(productsData);
    } catch (e) {
      console.error('File products.js không phải là JSON hợp lệ:', e);
      return;
    }
    
    // Cập nhật URLs hình ảnh
    for (const product of products) {
      if (Array.isArray(product.image)) {
        product.image = product.image.map(img => {
          // Nếu img là URL thì giữ nguyên, nếu không thì tìm trong mapping
          if (img.startsWith('http')) return img;
          
          // Tìm tên file trong mapping
          const fileName = Object.keys(imageMapping).find(key => {
            return key.includes(img.replace(/^p_img/, '').replace(/\.png$/, ''));
          });
          
          return fileName ? imageMapping[fileName] : img;
        });
      }
    }
    
    // Lưu file sản phẩm mới với URL Cloudinary
    const newProductsFilePath = path.join(__dirname, 'products_cloudinary.js');
    fs.writeFileSync(newProductsFilePath, JSON.stringify(products, null, 2));
    
    console.log(`File sản phẩm với URL Cloudinary đã được lưu tại: ${newProductsFilePath}`);
  } catch (error) {
    console.error('Lỗi khi tạo file sản phẩm với URL Cloudinary:', error);
  }
}

// Chạy script
uploadAllImages(); 