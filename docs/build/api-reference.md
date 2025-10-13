---
title: EnvStore API v0.1.0
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
highlight_theme: darkula
headingLevel: 2

---

<!-- Generator: Widdershins v4.0.1 -->

<h1 id="envstore-api">EnvStore API v0.1.0</h1>

> Scroll down for code samples, example requests and responses. Select a language for code samples from the tabs above or the mobile navigation menu.

Secure environment variable management API with end-to-end encryption.

## Authentication
Most endpoints require API key authentication via the `x-api-key` header.

## Rate Limiting
All endpoints are rate-limited to prevent abuse. Rate limit headers are included in responses.

## Caching
The `/v1/env/latest` endpoint uses Cloudflare KV caching with a 60-second TTL.

Base URLs:

* <a href="http://localhost:3000">http://localhost:3000</a>

* <a href="https://envstore.app">https://envstore.app</a>

Web: <a href="https://github.com/fenilsonani/envstore">EnvStore Support</a> 
License: <a href="https://opensource.org/licenses/MIT">MIT</a>

# Authentication

* API Key (ApiKeyAuth)
    - Parameter Name: **x-api-key**, in: header. API key for authentication

<h1 id="envstore-api-authentication">Authentication</h1>

User authentication endpoints

## signup

<a id="opIdsignup"></a>

> Code samples

```shell
# You can also use wget
curl -X POST http://localhost:3000/api/auth/signup \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'

```

```http
POST http://localhost:3000/api/auth/signup HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "email": "user@example.com",
  "password": "SecurePass123!"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json'
};

fetch('http://localhost:3000/api/auth/signup',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json'
}

result = RestClient.post 'http://localhost:3000/api/auth/signup',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.post('http://localhost:3000/api/auth/signup', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','http://localhost:3000/api/auth/signup', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:3000/api/auth/signup");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "http://localhost:3000/api/auth/signup", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /api/auth/signup`

*Create new user account*

Register a new user with email and password

> Body parameter

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

<h3 id="signup-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|object|true|none|
|» email|body|string(email)|true|User email address|
|» password|body|string(password)|true|User password (minimum 8 characters)|

> Example responses

> 200 Response

```json
{
  "ok": true
}
```

<h3 id="signup-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|User created successfully|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Invalid request|[Error](#schemaerror)|
|429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Rate limit exceeded|[Error](#schemaerror)|

<h3 id="signup-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» ok|boolean|false|none|none|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|429|X-RateLimit-Remaining|integer||Number of requests remaining|
|429|X-RateLimit-Reset|string|date-time|Time when the rate limit resets|

<aside class="success">
This operation does not require authentication
</aside>

## login

<a id="opIdlogin"></a>

> Code samples

```shell
# You can also use wget
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'

```

```http
POST http://localhost:3000/api/auth/login HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "email": "user@example.com",
  "password": "SecurePass123!"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json'
};

fetch('http://localhost:3000/api/auth/login',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json'
}

result = RestClient.post 'http://localhost:3000/api/auth/login',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.post('http://localhost:3000/api/auth/login', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','http://localhost:3000/api/auth/login', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:3000/api/auth/login");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "http://localhost:3000/api/auth/login", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /api/auth/login`

*Authenticate user*

Login with email and password to get a session cookie

> Body parameter

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

<h3 id="login-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|object|true|none|
|» email|body|string(email)|true|User email address|
|» password|body|string(password)|true|User password|

> Example responses

> 200 Response

```json
{
  "ok": true
}
```

<h3 id="login-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Login successful|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Invalid request|[Error](#schemaerror)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Invalid credentials|[Error](#schemaerror)|
|429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Rate limit exceeded|[Error](#schemaerror)|

<h3 id="login-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» ok|boolean|false|none|none|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|429|X-RateLimit-Remaining|integer||none|
|429|X-RateLimit-Reset|string|date-time|none|

<aside class="success">
This operation does not require authentication
</aside>

## logout

<a id="opIdlogout"></a>

> Code samples

```shell
# You can also use wget
curl -X POST http://localhost:3000/api/auth/logout \
  -H 'Accept: application/json' \
  -H 'x-api-key: API_KEY'

```

```http
POST http://localhost:3000/api/auth/logout HTTP/1.1
Host: localhost:3000
Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json',
  'x-api-key':'API_KEY'
};

fetch('http://localhost:3000/api/auth/logout',
{
  method: 'POST',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json',
  'x-api-key' => 'API_KEY'
}

result = RestClient.post 'http://localhost:3000/api/auth/logout',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json',
  'x-api-key': 'API_KEY'
}

r = requests.post('http://localhost:3000/api/auth/logout', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
    'x-api-key' => 'API_KEY',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','http://localhost:3000/api/auth/logout', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:3000/api/auth/logout");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
        "x-api-key": []string{"API_KEY"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "http://localhost:3000/api/auth/logout", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /api/auth/logout`

*Logout user*

Invalidate current session

> Example responses

> 200 Response

```json
{
  "ok": true
}
```

<h3 id="logout-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Logout successful|Inline|

<h3 id="logout-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» ok|boolean|false|none|none|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
ApiKeyAuth
</aside>

<h1 id="envstore-api-environment-variables">Environment Variables</h1>

Environment variable management endpoints

## getLatestEnv

<a id="opIdgetLatestEnv"></a>

> Code samples

```shell
# You can also use wget
curl -X GET http://localhost:3000/api/v1/env/latest?projectId=497f6eca-6276-4993-bfeb-53cbbbba6f08&environment=production \
  -H 'Accept: application/json' \
  -H 'x-api-key: API_KEY'

```

```http
GET http://localhost:3000/api/v1/env/latest?projectId=497f6eca-6276-4993-bfeb-53cbbbba6f08&environment=production HTTP/1.1
Host: localhost:3000
Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json',
  'x-api-key':'API_KEY'
};

fetch('http://localhost:3000/api/v1/env/latest?projectId=497f6eca-6276-4993-bfeb-53cbbbba6f08&environment=production',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json',
  'x-api-key' => 'API_KEY'
}

result = RestClient.get 'http://localhost:3000/api/v1/env/latest',
  params: {
  'projectId' => 'string(uuid)',
'environment' => 'string'
}, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json',
  'x-api-key': 'API_KEY'
}

r = requests.get('http://localhost:3000/api/v1/env/latest', params={
  'projectId': '497f6eca-6276-4993-bfeb-53cbbbba6f08',  'environment': 'production'
}, headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
    'x-api-key' => 'API_KEY',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('GET','http://localhost:3000/api/v1/env/latest', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:3000/api/v1/env/latest?projectId=497f6eca-6276-4993-bfeb-53cbbbba6f08&environment=production");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
        "x-api-key": []string{"API_KEY"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "http://localhost:3000/api/v1/env/latest", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /api/v1/env/latest`

*Get latest environment file*

Retrieve the latest encrypted environment file for a specific project and environment.

This endpoint is cached with a 60-second TTL for improved performance.
Check the `X-Cache` header to see if the response was served from cache.

<h3 id="getlatestenv-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|projectId|query|string(uuid)|true|Project UUID|
|environment|query|string|true|Environment name (e.g., development, staging, production)|

> Example responses

> 200 Response

```json
{
  "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
  "version": 0,
  "ciphertext": "string",
  "iv": "string",
  "salt": "string",
  "checksum": "string"
}
```

<h3 id="getlatestenv-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Environment file retrieved successfully|[EncryptedEnvFile](#schemaencryptedenvfile)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Invalid request parameters|[Error](#schemaerror)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Unauthorized - Invalid or missing API key|[Error](#schemaerror)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Project or environment file not found|[Error](#schemaerror)|
|429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Rate limit exceeded|[Error](#schemaerror)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|X-Cache|string||Cache status|
|429|Retry-After|integer||Seconds to wait before retrying|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
ApiKeyAuth
</aside>

## uploadEnv

<a id="opIduploadEnv"></a>

> Code samples

```shell
# You can also use wget
curl -X POST http://localhost:3000/api/v1/env/upload \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'x-api-key: API_KEY'

```

```http
POST http://localhost:3000/api/v1/env/upload HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "environment": "production",
  "content": "DATABASE_URL=postgresql://localhost:5432/db\nAPI_KEY=secret123\n",
  "passphrase": "my-secure-passphrase"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'x-api-key':'API_KEY'
};

fetch('http://localhost:3000/api/v1/env/upload',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'x-api-key' => 'API_KEY'
}

result = RestClient.post 'http://localhost:3000/api/v1/env/upload',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'x-api-key': 'API_KEY'
}

r = requests.post('http://localhost:3000/api/v1/env/upload', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'x-api-key' => 'API_KEY',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','http://localhost:3000/api/v1/env/upload', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:3000/api/v1/env/upload");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "x-api-key": []string{"API_KEY"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "http://localhost:3000/api/v1/env/upload", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /api/v1/env/upload`

*Upload environment file*

Upload a new version of an encrypted environment file.

You can either:
- Provide plaintext content and passphrase (server-side encryption)
- Provide pre-encrypted data (client-side encryption)

The upload automatically increments the version number and invalidates the cache.

> Body parameter

```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "environment": "production",
  "content": "DATABASE_URL=postgresql://localhost:5432/db\nAPI_KEY=secret123\n",
  "passphrase": "my-secure-passphrase"
}
```

<h3 id="uploadenv-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|any|true|none|

> Example responses

> 200 Response

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "version": 5
}
```

<h3 id="uploadenv-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Environment file uploaded successfully|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Invalid request|[Error](#schemaerror)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Unauthorized|[Error](#schemaerror)|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Project not found|[Error](#schemaerror)|
|429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Rate limit exceeded|[Error](#schemaerror)|

<h3 id="uploadenv-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» id|string(uuid)|false|none|File ID|
|» version|integer|false|none|New version number|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|429|Retry-After|integer||none|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
ApiKeyAuth
</aside>

<h1 id="envstore-api-health">Health</h1>

System health check endpoints

## kvHealthCheck

<a id="opIdkvHealthCheck"></a>

> Code samples

```shell
# You can also use wget
curl -X GET http://localhost:3000/api/v1/kv/health \
  -H 'Accept: application/json'

```

```http
GET http://localhost:3000/api/v1/kv/health HTTP/1.1
Host: localhost:3000
Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('http://localhost:3000/api/v1/kv/health',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json'
}

result = RestClient.get 'http://localhost:3000/api/v1/kv/health',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('http://localhost:3000/api/v1/kv/health', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('GET','http://localhost:3000/api/v1/kv/health', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("http://localhost:3000/api/v1/kv/health");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "http://localhost:3000/api/v1/kv/health", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /api/v1/kv/health`

*KV health check*

Check the health and connectivity of the Cloudflare KV storage

> Example responses

> 200 Response

```json
{
  "ok": true,
  "roundtripMs": 45.2
}
```

<h3 id="kvhealthcheck-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|KV is healthy|Inline|
|429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Rate limit exceeded|[Error](#schemaerror)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|KV unhealthy or misconfigured|Inline|

<h3 id="kvhealthcheck-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» ok|boolean|false|none|none|
|» roundtripMs|number|false|none|Round-trip time in milliseconds|

Status Code **500**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» ok|boolean|false|none|none|
|» error|string|false|none|none|
|» config|object|false|none|none|
|»» hasAccount|boolean|false|none|none|
|»» hasNamespace|boolean|false|none|none|
|»» hasToken|boolean|false|none|none|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|X-KV-Health|string||none|
|429|Retry-After|integer||none|
|500|X-KV-Health|string||none|

<aside class="success">
This operation does not require authentication
</aside>

# Schemas

<h2 id="tocS_Error">Error</h2>
<!-- backwards compatibility -->
<a id="schemaerror"></a>
<a id="schema_Error"></a>
<a id="tocSerror"></a>
<a id="tocserror"></a>

```json
{
  "error": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|error|string|true|none|Error message or code|

<h2 id="tocS_EncryptedEnvFile">EncryptedEnvFile</h2>
<!-- backwards compatibility -->
<a id="schemaencryptedenvfile"></a>
<a id="schema_EncryptedEnvFile"></a>
<a id="tocSencryptedenvfile"></a>
<a id="tocsencryptedenvfile"></a>

```json
{
  "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
  "version": 0,
  "ciphertext": "string",
  "iv": "string",
  "salt": "string",
  "checksum": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|id|string(uuid)|true|none|File ID|
|version|integer|true|none|File version number|
|ciphertext|string|true|none|Base64-encoded encrypted content|
|iv|string|true|none|Base64-encoded initialization vector|
|salt|string|true|none|Base64-encoded salt|
|checksum|string|true|none|SHA-256 checksum for integrity verification|

<h2 id="tocS_PlaintextUpload">PlaintextUpload</h2>
<!-- backwards compatibility -->
<a id="schemaplaintextupload"></a>
<a id="schema_PlaintextUpload"></a>
<a id="tocSplaintextupload"></a>
<a id="tocsplaintextupload"></a>

```json
{
  "projectId": "5a8591dd-4039-49df-9202-96385ba3eff8",
  "environment": "string",
  "content": "string",
  "passphrase": "stringst"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|projectId|string(uuid)|true|none|Project UUID|
|environment|string|true|none|Environment name|
|content|string|true|none|Plaintext environment file content|
|passphrase|string|true|none|Encryption passphrase (minimum 8 characters)|

<h2 id="tocS_EncryptedUpload">EncryptedUpload</h2>
<!-- backwards compatibility -->
<a id="schemaencryptedupload"></a>
<a id="schema_EncryptedUpload"></a>
<a id="tocSencryptedupload"></a>
<a id="tocsencryptedupload"></a>

```json
{
  "projectId": "5a8591dd-4039-49df-9202-96385ba3eff8",
  "environment": "string",
  "ciphertext": "string",
  "iv": "string",
  "salt": "string",
  "checksum": "string"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|projectId|string(uuid)|true|none|Project UUID|
|environment|string|true|none|Environment name|
|ciphertext|string|true|none|Base64-encoded encrypted content|
|iv|string|true|none|Base64-encoded initialization vector|
|salt|string|true|none|Base64-encoded salt|
|checksum|string|true|none|SHA-256 checksum|

