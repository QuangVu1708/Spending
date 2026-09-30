const fs = require('fs');

function forceReload(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  content = content.replace(
    /alert\(['"`]\?A lu giao d<ch vAo CSDL!['"`]\);/,
    "alert('Đã lưu giao dịch và tự động cập nhật số dư ví!');"
  );
  content = content.replace(
    /alert\(['"`]Đã lưu giao dịch vào cơ sở dữ liệu!['"`]\);/,
    "alert('Đã lưu giao dịch và tự động cập nhật số dư ví!');"
  );
  content = content.replace(/router\.refresh\(\);/g, "window.location.reload();");
  fs.writeFileSync(filePath, content, 'utf-8');
}

forceReload('src/components/smart-input/SmartTextInput.tsx');
forceReload('src/components/smart-input/ImageUpload.tsx');
console.log('Fixed reload');
