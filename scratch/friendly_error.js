const fs = require('fs');
let content = fs.readFileSync('src/app/api/ai/parse/route.ts', 'utf-8');

const target = `  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }`;

const replacement = `  } catch (error: any) {
    console.error('Gemini API Error:', error);
    
    // Xử lý lỗi 503 Overloaded hoặc các lỗi Google trả về
    const errorString = String(error.message || error);
    let friendlyMessage = 'Lỗi kết nối đến máy chủ AI.';
    
    if (errorString.includes('503') || errorString.includes('experiencing high demand') || errorString.includes('UNAVAILABLE')) {
      friendlyMessage = 'Hệ thống AI của Google hiện đang quá tải do có quá nhiều người sử dụng. Vui lòng thử lại sau giây lát hoặc sử dụng nút Nhập thủ công nhé!';
    } else if (errorString.includes('404') || errorString.includes('not found')) {
      friendlyMessage = 'Phiên bản AI này hiện không khả dụng. Vui lòng kiểm tra lại cấu hình phiên bản Gemini.';
    } else if (errorString.includes('API_KEY')) {
      friendlyMessage = 'Vui lòng kiểm tra lại GEMINI_API_KEY của bạn.';
    }

    return NextResponse.json({ error: friendlyMessage }, { status: 500 });
  }`;

content = content.replace(target, replacement);
fs.writeFileSync('src/app/api/ai/parse/route.ts', content, 'utf-8');
console.log('Updated error handling');
