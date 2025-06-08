const fetch = require('node-fetch');
const fs = require('fs').promises;

const backendUrl = 'http://localhost:4001'; // Cổng 4001 thay vì 4000 do cổng 4000 đã bị sử dụng

async function uploadProducts() {
  try {
    // Đọc file JSON
    const productsData = await fs.readFile('./products.js', 'utf8');
    const products = JSON.parse(productsData);
    
    console.log(`Chuẩn bị tải lên ${products.length} sản phẩm...`);
    
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
    
    // Tải lên từng sản phẩm
    for (let product of products) {
      const response = await fetch(`${backendUrl}/api/product/add-json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(product)
      });
      
      const data = await response.json();
      if (data.success) {
        console.log(`Đã thêm sản phẩm: ${product.name}`);
      } else {
        console.error(`Lỗi khi thêm sản phẩm ${product.name}:`, data.message);
      }
      
      // Đợi 500ms để tránh quá tải server
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('Hoàn thành việc tải lên sản phẩm!');
  } catch (error) {
    console.error('Lỗi:', error);
  }
}

uploadProducts(); 