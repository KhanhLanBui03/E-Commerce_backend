import fs from 'fs/promises';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

// Lấy đường dẫn hiện tại trong ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendUrl = 'http://localhost:4001'; // Cổng 4001 thay vì 4000 do cổng 4000 đã bị sử dụng

async function bulkImportProducts() {
  try {
    // Đọc file JSON
    const productsFilePath = path.join(__dirname, 'products_cloudinary.js');
    const productsData = await fs.readFile(productsFilePath, 'utf8');
    const products = JSON.parse(productsData);
    
    console.log(`Chuẩn bị import ${products.length} sản phẩm...`);
    
    // Đăng nhập admin trước (nếu cần)
    const loginResponse = await fetch(`${backendUrl}/api/user/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        email: 'admin@forever.com', 
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.success) {
      throw new Error('Đăng nhập thất bại: ' + loginData.message);
    }
    
    const token = loginData.token;
    console.log('Đăng nhập thành công, token:', token);
    
    // Import hàng loạt sản phẩm
    const response = await fetch(`${backendUrl}/api/product/bulk-import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ products })
    });
    
    const data = await response.json();
    if (data.success) {
      console.log(`✅ Import thành công: ${data.message}`);
      console.log(`- Tổng số sản phẩm: ${data.results.total}`);
      console.log(`- Thành công: ${data.results.success}`);
      console.log(`- Thất bại: ${data.results.failed}`);
      
      if (data.results.errors.length > 0) {
        console.log('Các lỗi:');
        data.results.errors.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error.product}: ${error.error}`);
        });
      }
    } else {
      console.error(`❌ Import thất bại: ${data.message}`);
    }
  } catch (error) {
    console.error('Lỗi:', error);
  }
}

bulkImportProducts(); 