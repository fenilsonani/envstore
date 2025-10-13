# EnvStore SDK Examples

This document provides code examples for integrating with the EnvStore API in multiple programming languages.

## Table of Contents

- [JavaScript/TypeScript](#javascripttypescript)
- [Python](#python)
- [Go](#go)
- [Rust](#rust)
- [cURL](#curl)

## Authentication

All API requests (except health checks and auth endpoints) require an API key passed via the `x-api-key` header.

```bash
x-api-key: your-api-key-here
```

## JavaScript/TypeScript

### Installation

```bash
npm install node-fetch
# or
pnpm add node-fetch
```

### Upload Environment File

```typescript
interface UploadRequest {
  projectId: string;
  environment: string;
  content: string;
  passphrase: string;
}

interface UploadResponse {
  id: string;
  version: number;
}

async function uploadEnv(data: UploadRequest): Promise<UploadResponse> {
  const response = await fetch('https://envstore.app/api/v1/env/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ENVSTORE_API_KEY!,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return response.json();
}

// Usage
const result = await uploadEnv({
  projectId: '550e8400-e29b-41d4-a716-446655440000',
  environment: 'production',
  content: 'DATABASE_URL=postgresql://localhost:5432/db\nAPI_KEY=secret123',
  passphrase: 'my-secure-passphrase',
});

console.log(`Uploaded version ${result.version}`);
```

### Retrieve Latest Environment File

```typescript
interface EnvFile {
  id: string;
  version: number;
  ciphertext: string;
  iv: string;
  salt: string;
  checksum: string;
}

async function getLatestEnv(
  projectId: string,
  environment: string
): Promise<EnvFile> {
  const url = new URL('https://envstore.app/api/v1/env/latest');
  url.searchParams.set('projectId', projectId);
  url.searchParams.set('environment', environment);

  const response = await fetch(url, {
    headers: {
      'x-api-key': process.env.ENVSTORE_API_KEY!,
    },
  });

  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.statusText}`);
  }

  const cacheStatus = response.headers.get('X-Cache');
  console.log(`Cache: ${cacheStatus}`);

  return response.json();
}

// Usage
const envFile = await getLatestEnv(
  '550e8400-e29b-41d4-a716-446655440000',
  'production'
);
```

### Client-Side Decryption

```typescript
import crypto from 'node:crypto';

function decryptEnvFile(
  envFile: EnvFile,
  passphrase: string
): string {
  const algorithm = 'aes-256-gcm';

  // Derive key from passphrase and salt
  const key = crypto.pbkdf2Sync(
    passphrase,
    Buffer.from(envFile.salt, 'base64'),
    100000,
    32,
    'sha256'
  );

  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(envFile.iv, 'base64')
  );

  const ciphertext = Buffer.from(envFile.ciphertext, 'base64');
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

// Usage
const content = decryptEnvFile(envFile, 'my-secure-passphrase');
console.log(content);
```

## Python

### Installation

```bash
pip install requests cryptography
```

### Upload Environment File

```python
import requests
from typing import Dict, Any

def upload_env(
    project_id: str,
    environment: str,
    content: str,
    passphrase: str,
    api_key: str
) -> Dict[str, Any]:
    """Upload an environment file to EnvStore."""

    url = 'https://envstore.app/api/v1/env/upload'
    headers = {
        'Content-Type': 'application/json',
        'x-api-key': api_key,
    }
    data = {
        'projectId': project_id,
        'environment': environment,
        'content': content,
        'passphrase': passphrase,
    }

    response = requests.post(url, json=data, headers=headers)
    response.raise_for_status()

    return response.json()

# Usage
result = upload_env(
    project_id='550e8400-e29b-41d4-a716-446655440000',
    environment='production',
    content='DATABASE_URL=postgresql://localhost:5432/db',
    passphrase='my-secure-passphrase',
    api_key='your-api-key'
)
print(f"Uploaded version {result['version']}")
```

### Retrieve and Decrypt

```python
import base64
import hashlib
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.backends import default_backend

def get_latest_env(project_id: str, environment: str, api_key: str) -> Dict[str, Any]:
    """Retrieve latest environment file."""

    url = 'https://envstore.app/api/v1/env/latest'
    params = {
        'projectId': project_id,
        'environment': environment,
    }
    headers = {'x-api-key': api_key}

    response = requests.get(url, params=params, headers=headers)
    response.raise_for_status()

    cache_status = response.headers.get('X-Cache')
    print(f"Cache: {cache_status}")

    return response.json()

def decrypt_env_file(env_file: Dict[str, Any], passphrase: str) -> str:
    """Decrypt an encrypted environment file."""

    # Derive key from passphrase and salt
    salt = base64.b64decode(env_file['salt'])
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
        backend=default_backend()
    )
    key = kdf.derive(passphrase.encode())

    # Decrypt
    iv = base64.b64decode(env_file['iv'])
    ciphertext = base64.b64decode(env_file['ciphertext'])

    cipher = Cipher(
        algorithms.AES(key),
        modes.GCM(iv),
        backend=default_backend()
    )
    decryptor = cipher.decryptor()

    plaintext = decryptor.update(ciphertext) + decryptor.finalize()
    return plaintext.decode('utf-8')

# Usage
env_file = get_latest_env(
    '550e8400-e29b-41d4-a716-446655440000',
    'production',
    'your-api-key'
)
content = decrypt_env_file(env_file, 'my-secure-passphrase')
print(content)
```

## Go

### Upload Environment File

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "os"
)

type UploadRequest struct {
    ProjectID   string `json:"projectId"`
    Environment string `json:"environment"`
    Content     string `json:"content"`
    Passphrase  string `json:"passphrase"`
}

type UploadResponse struct {
    ID      string `json:"id"`
    Version int    `json:"version"`
}

func uploadEnv(data UploadRequest, apiKey string) (*UploadResponse, error) {
    jsonData, err := json.Marshal(data)
    if err != nil {
        return nil, err
    }

    req, err := http.NewRequest(
        "POST",
        "https://envstore.app/api/v1/env/upload",
        bytes.NewBuffer(jsonData),
    )
    if err != nil {
        return nil, err
    }

    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("x-api-key", apiKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        body, _ := io.ReadAll(resp.Body)
        return nil, fmt.Errorf("upload failed: %s", body)
    }

    var result UploadResponse
    if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
        return nil, err
    }

    return &result, nil
}

func main() {
    result, err := uploadEnv(UploadRequest{
        ProjectID:   "550e8400-e29b-41d4-a716-446655440000",
        Environment: "production",
        Content:     "DATABASE_URL=postgresql://localhost:5432/db",
        Passphrase:  "my-secure-passphrase",
    }, os.Getenv("ENVSTORE_API_KEY"))

    if err != nil {
        panic(err)
    }

    fmt.Printf("Uploaded version %d\n", result.Version)
}
```

### Retrieve Latest Environment

```go
type EnvFile struct {
    ID         string `json:"id"`
    Version    int    `json:"version"`
    Ciphertext string `json:"ciphertext"`
    IV         string `json:"iv"`
    Salt       string `json:"salt"`
    Checksum   string `json:"checksum"`
}

func getLatestEnv(projectID, environment, apiKey string) (*EnvFile, error) {
    url := fmt.Sprintf(
        "https://envstore.app/api/v1/env/latest?projectId=%s&environment=%s",
        projectID,
        environment,
    )

    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        return nil, err
    }

    req.Header.Set("x-api-key", apiKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        body, _ := io.ReadAll(resp.Body)
        return nil, fmt.Errorf("fetch failed: %s", body)
    }

    cacheStatus := resp.Header.Get("X-Cache")
    fmt.Printf("Cache: %s\n", cacheStatus)

    var envFile EnvFile
    if err := json.NewDecoder(resp.Body).Decode(&envFile); err != nil {
        return nil, err
    }

    return &envFile, nil
}
```

## Rust

### Dependencies

```toml
[dependencies]
reqwest = { version = "0.11", features = ["json"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1", features = ["full"] }
```

### Upload Environment File

```rust
use reqwest::header::{HeaderMap, HeaderValue, CONTENT_TYPE};
use serde::{Deserialize, Serialize};
use std::error::Error;

#[derive(Serialize)]
struct UploadRequest {
    #[serde(rename = "projectId")]
    project_id: String,
    environment: String,
    content: String,
    passphrase: String,
}

#[derive(Deserialize)]
struct UploadResponse {
    id: String,
    version: i32,
}

async fn upload_env(
    data: UploadRequest,
    api_key: &str,
) -> Result<UploadResponse, Box<dyn Error>> {
    let client = reqwest::Client::new();

    let mut headers = HeaderMap::new();
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));
    headers.insert("x-api-key", HeaderValue::from_str(api_key)?);

    let response = client
        .post("https://envstore.app/api/v1/env/upload")
        .headers(headers)
        .json(&data)
        .send()
        .await?;

    if !response.status().is_success() {
        return Err(format!("Upload failed: {}", response.status()).into());
    }

    let result: UploadResponse = response.json().await?;
    Ok(result)
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let result = upload_env(
        UploadRequest {
            project_id: "550e8400-e29b-41d4-a716-446655440000".to_string(),
            environment: "production".to_string(),
            content: "DATABASE_URL=postgresql://localhost:5432/db".to_string(),
            passphrase: "my-secure-passphrase".to_string(),
        },
        "your-api-key",
    ).await?;

    println!("Uploaded version {}", result.version);
    Ok(())
}
```

## cURL

### Upload Environment File

```bash
curl -X POST https://envstore.app/api/v1/env/upload \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "projectId": "550e8400-e29b-41d4-a716-446655440000",
    "environment": "production",
    "content": "DATABASE_URL=postgresql://localhost:5432/db\nAPI_KEY=secret123",
    "passphrase": "my-secure-passphrase"
  }'
```

### Retrieve Latest Environment

```bash
curl "https://envstore.app/api/v1/env/latest?projectId=550e8400-e29b-41d4-a716-446655440000&environment=production" \
  -H "x-api-key: YOUR_API_KEY" \
  -v
```

### Health Check

```bash
curl https://envstore.app/api/v1/kv/health
```

### Authentication

```bash
# Signup
curl -X POST https://envstore.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'

# Login
curl -X POST https://envstore.app/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'

# Logout
curl -X POST https://envstore.app/api/auth/logout \
  -b cookies.txt
```

## Rate Limiting

All endpoints are rate-limited. When you hit the rate limit, you'll receive a 429 response:

```json
{
  "error": "rate_limited"
}
```

Response headers will include:
- `Retry-After`: Seconds to wait before retrying
- `X-RateLimit-Remaining`: Requests remaining in current window (for authenticated endpoints)

## Error Handling

All error responses follow this format:

```json
{
  "error": "error_code_or_message"
}
```

Common error codes:
- `unauthorized` - Invalid or missing API key
- `not_found` - Resource not found
- `invalid` - Invalid request parameters
- `rate_limited` - Rate limit exceeded

## Best Practices

1. **Cache API Keys**: Store your API key securely in environment variables
2. **Handle Rate Limits**: Implement exponential backoff when receiving 429 responses
3. **Use HTTPS**: Always use HTTPS endpoints in production
4. **Validate Checksums**: Verify the checksum after decryption to ensure data integrity
5. **Secure Passphrases**: Use strong, unique passphrases for each project/environment

## Support

For questions or issues, please:
- Open an issue on [GitHub](https://github.com/fenilsonani/envstore)
- Email support@envstore.app
