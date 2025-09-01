# TVU Authentication API Guide

## 📋 Tổng Quan

Hệ thống TVU (Trường Đại học Trà Vinh) đã cập nhật cơ chế xác thực mới sử dụng **Base64 encoded parameters** thay vì API POST truyền thống.

### ⚠️ Thay Đổi Quan Trọng
- **API cũ:** `POST /api/auth/login` ❌ (Không còn hoạt động)
- **API mới:** `GET /api/pn-signin` ✅ (Đang sử dụng)

---

## 🔧 API Endpoint Mới

### **URL**
```
GET https://ttsv.tvu.edu.vn/api/pn-signin
```

### **Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | string | ✅ | Base64 encoded JSON chứa credentials |
| `gopage` | string | ❌ | Optional redirect parameter |
| `mgr` | integer | ❌ | Management flag (mặc định: 1) |

---

## 🛠 Cách Tạo Parameter `code`

### **Bước 1: Tạo JSON Object**
```json
{
    "username": "DH12345",
    "password": "your_password",
    "uri": "https://ttsv.tvu.edu.vn/#/home"
}
```

### **Bước 2: Encode Base64**

#### **JavaScript (Browser Console)**
```javascript
const credentials = {
    "username": "DH12345",
    "password": "your_password", 
    "uri": "https://ttsv.tvu.edu.vn/#/home"
};

const code = btoa(JSON.stringify(credentials));
console.log(code);
```

#### **C# (.NET)**
```csharp
using System;
using System.Text;
using Newtonsoft.Json;

var credentials = new {
    username = "DH12345",
    password = "your_password",
    uri = "https://ttsv.tvu.edu.vn/#/home"
};

string json = JsonConvert.SerializeObject(credentials);
string code = Convert.ToBase64String(Encoding.UTF8.GetBytes(json));
```

#### **Python**
```python
import json
import base64

credentials = {
    "username": "DH12345",
    "password": "your_password",
    "uri": "https://ttsv.tvu.edu.vn/#/home"
}

json_str = json.dumps(credentials)
code = base64.b64encode(json_str.encode()).decode()
```

---

## 📨 Cấu Hình Request

### **Postman Configuration**

#### **Method & URL**
```
Method: GET
URL: https://ttsv.tvu.edu.vn/api/pn-signin
```

#### **Parameters Tab**
```
code: eyJ1c2VybmFtZSI6IkRIMTIzNDUiLCJwYXNzd29yZCI6InlvdXJfcGFzc3dvcmQiLCJ1cmkiOiJodHRwczovL3R0c3YudHZ1LmVkdS52bi8jL2hvbWUifQ==
gopage: (empty)
mgr: 1
```

#### **Headers**
```
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
```

### **cURL Example**
```bash
curl -X GET \
  "https://ttsv.tvu.edu.vn/api/pn-signin?code=eyJ1c2VybmFtZSI6IkRIMTIzNDUiLCJwYXNzd29yZCI6InlvdXJfcGFzc3dvcmQiLCJ1cmkiOiJodHRwczovL3R0c3YudHZ1LmVkdS52bi8jL2hvbWUifQ%3D%3D&mgr=1" \
  -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
```

---

## 📊 Response Format

### **Successful Response (200/302)**

#### **JSON Response**
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "user_id": "DH12345",
        "name": "Nguyễn Văn A",
        "session_token": "abc123...",
        "redirect_url": "https://ttsv.tvu.edu.vn/#/home"
    }
}
```

#### **Redirect Response (302)**
```
Status: 302 Found
Location: https://ttsv.tvu.edu.vn/#/home
Set-Cookie: session_id=xyz789; Path=/; HttpOnly; Secure
Set-Cookie: user_token=abc123; Path=/; HttpOnly; Secure
```

### **Error Response (400/401)**
```json
{
    "success": false,
    "error": "invalid_credentials",
    "message": "Invalid username or password"
}
```

---

## 💻 Implementation Examples

### **C# (HttpClient)**
```csharp
using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

public class TvuAuthService
{
    private readonly HttpClient _httpClient;
    private const string BASE_URL = "https://ttsv.tvu.edu.vn";

    public TvuAuthService()
    {
        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Add("Accept", 
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
        _httpClient.DefaultRequestHeaders.Add("User-Agent", 
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
    }

    public async Task<HttpResponseMessage> LoginAsync(string username, string password)
    {
        var credentials = new {
            username = username,
            password = password,
            uri = "https://ttsv.tvu.edu.vn/#/home"
        };

        string json = JsonConvert.SerializeObject(credentials);
        string code = Convert.ToBase64String(Encoding.UTF8.GetBytes(json));
        
        string url = $"{BASE_URL}/api/pn-signin?code={Uri.EscapeDataString(code)}&mgr=1";
        
        return await _httpClient.GetAsync(url);
    }
}
```

### **JavaScript (Fetch API)**
```javascript
class TvuAuthService {
    static BASE_URL = 'https://ttsv.tvu.edu.vn';

    static async login(username, password) {
        const credentials = {
            username: username,
            password: password,
            uri: 'https://ttsv.tvu.edu.vn/#/home'
        };

        const code = btoa(JSON.stringify(credentials));
        const url = `${this.BASE_URL}/api/pn-signin?code=${encodeURIComponent(code)}&mgr=1`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }
}
```

### **Python (Requests)**
```python
import requests
import json
import base64
from urllib.parse import quote

class TvuAuthService:
    BASE_URL = 'https://ttsv.tvu.edu.vn'
    
    @classmethod
    def login(cls, username, password):
        credentials = {
            "username": username,
            "password": password,
            "uri": "https://ttsv.tvu.edu.vn/#/home"
        }
        
        json_str = json.dumps(credentials)
        code = base64.b64encode(json_str.encode()).decode()
        
        url = f"{cls.BASE_URL}/api/pn-signin"
        params = {
            'code': code,
            'mgr': 1
        }
        
        headers = {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        try:
            response = requests.get(url, params=params, headers=headers)
            return response
        except Exception as e:
            print(f"Login error: {e}")
            raise
```

---

## 🔒 Security Notes

### **⚠️ Quan Trọng**
1. **Base64 không phải encryption:** Credentials có thể dễ dàng decode
2. **Luôn sử dụng HTTPS:** Tránh man-in-the-middle attacks
3. **Validate input:** Kiểm tra username/password trước khi encode
4. **Handle errors properly:** Không log credentials trong error messages

### **Best Practices**
- ✅ Validate credentials format trước khi gửi
- ✅ Handle network timeouts và retries
- ✅ Properly encode special characters
- ✅ Store tokens/sessions securely
- ❌ Không hardcode credentials trong code
- ❌ Không log credentials ra console/file

---

## 🧪 Testing

### **Test Cases**

#### **Valid Credentials**
```json
Input: {"username": "DH12345", "password": "correct_password", "uri": "https://ttsv.tvu.edu.vn/#/home"}
Expected: 200/302 với session cookies hoặc redirect
```

#### **Invalid Username**
```json
Input: {"username": "INVALID", "password": "any_password", "uri": "https://ttsv.tvu.edu.vn/#/home"}
Expected: 401 Unauthorized
```

#### **Invalid Password**
```json
Input: {"username": "DH12345", "password": "wrong_password", "uri": "https://ttsv.tvu.edu.vn/#/home"}
Expected: 401 Unauthorized
```

#### **Malformed Base64**
```
Input: code=invalid_base64_string
Expected: 400 Bad Request
```

---

## 🔧 Troubleshooting

### **Common Issues**

| Issue | Cause | Solution |
|-------|-------|----------|
| 405 Method Not Allowed | Sử dụng POST thay vì GET | Đổi method thành GET |
| 400 Bad Request | Base64 encoding sai | Kiểm tra lại JSON format và encoding |
| 401 Unauthorized | Username/password sai | Xác nhận credentials |
| URL encoding issues | Special characters trong password | Sử dụng proper URL encoding |

### **Debug Steps**
1. ✅ Verify JSON format
2. ✅ Test Base64 encoding/decoding
3. ✅ Check URL encoding
4. ✅ Verify endpoint URL
5. ✅ Test with known good credentials

---

## 📝 Migration Guide

### **Từ API Cũ sang API Mới**

#### **Before (API cũ)**
```csharp
// POST request với form data
var loginData = new StringContent(
    $"username={mssv}&password={password}&grant_type=password",
    System.Text.Encoding.UTF8,
    "application/x-www-form-urlencoded"
);

var response = await client.PostAsync($"{API_URL}/api/auth/login", loginData);
```

#### **After (API mới)**
```csharp
// GET request với encoded parameters
var credentials = new { username = mssv, password = password, uri = "https://ttsv.tvu.edu.vn/#/home" };
string code = Convert.ToBase64String(Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(credentials)));
string url = $"{API_URL}/api/pn-signin?code={Uri.EscapeDataString(code)}&mgr=1";

var response = await client.GetAsync(url);
```

---

## 📞 Support

- **University:** Trường Đại học Trà Vinh (TVU)
- **System:** TTSV Portal
- **Documentation:** This guide
- **Last Updated:** December 2024

---

*⚠️ Lưu ý: API này có thể thay đổi mà không báo trước. Vui lòng kiểm tra thường xuyên để cập nhật.*
