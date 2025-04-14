🚀 Backend 
-
Authentication API (JWT, RBAC, Refresh Token, Redis)
A secure and scalable authentication system built for modern web applications.
Includes features like JWT-based authentication, Role-Based Access Control, Session Management, and Refresh Token logic, powered by Redis for performance.




## Tech Stack
**Server:** Nest.Js , Redis , Postgresql


## .ENV
```
DATABASE_URL=""
JWT_SECRET = ""
JWT_EXPIRESIN = "5m" 
JWT_REFRESH = ""
JWT_REFRESH_EXPIRESIN = "7d"
COOKIE_SECRET = ""
BULL_HOST = 'localhost'
BULL_PORT = Number
REDIS_HOST = 'localhost'
REDIS_PORT = Number
AUTHMEMBER_TTL = Number

```
## 📌 Features


✅ User Registration & Login

✅ Role-Based Access Control (RBAC) — (Admin / User)

✅ JWT Access Token + Refresh Token System

✅ Secure Session with HTTP-only Cookies

✅ Redis for Token Storage and Caching

✅ Authentication Middleware

✅ Input Validation & Error Handling

✅ API Documentation with Swagger (optional)

✅ Project Structure Ready for Scaling



## ⚙️ Optimizations

- **Redis-powered Job Queue for Registration**  
   Used Redis to offload registration-related tasks such as sending emails and 
   storing audit logs into background jobs. This significantly improved 
   response time and reduced load on the main thread.



### API EXAMPLE

### Register User

This endpoint allows the client to register a new user with the provided email, password, and name.

#### Request Body
```
http://localhost:5000/api/auth/register
```
- email (text, required): The email address of the user.
    
- password (text, required): The password for the user account.
    
- name (text, required): The name of the user.
    

#### Response (201 - Created)

The response will be in JSON format and will have the following schema:

``` json
{
    "type": "object",
    "properties": {
        "status": {
            "type": "string"
        },
        "message": {
            "type": "string"
        },
        "data": {
            "type": "object",
            "properties": {
                "queueId": {
                    "type": "string"
                },
                "queuePosition": {
                    "type": "string"
                },
                "estimatedTime": {
                    "type": "string"
                }
            }
        },
        "requestedBy": {
            "type": "string"
        }
    }
}

 ```
 This endpoint allows users to log in by sending a POST request to the specified URL. The request should include the user's email and password in the request body. Upon successful execution, the server responds with a status code of 201 and a JSON object in the response body. The JSON object contains a status message, along with data including access_token and refresh_token.

### Request Body
```
http://localhost:5000/api/auth/login
```
- email (string): The email of the user.
    
- password (string): The password of the user.
    

### Response

- Status: 201
    
- Content-Type: application/json
    
- status (string): A status message indicating the outcome of the request.
    
- message (string): A message related to the login process.
    
- data (object): An object containing access_token and refresh_token for the logged-in user.
    
    - access_token (string): The access token for the user's session.
        
    - refresh_token (string): The refresh token for the user's session.

### example
```
{
    "status": "SUCCESS",
    "message": "เข้าสู่ระบบสำเร็จ",
    "data": {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.",
        "refresh_token": "owLCJjcmVhdGVkQXQiOiIyMDI1LTA0LTE0VDEzOjI2OjM3LjExM1o"
    }
}
```

### Get User Profile

This endpoint is used to retrieve the profile information of the authenticated user.

**Request Body**  
This is a GET request and does not require a request body.

**Response**

- Status: 200 OK
    
- Content-Type: application/json
    

``` json
{
    "email": "",
    "memberId": "",
    "name": "",
    "phone": null,
    "address": null,
    "role": "",
    "point": 0,
    "balance": 0,
    "createdAt": "",
    "updatedAt": null,
    "createdBy": "",
    "updatedBy": "",
    "iat": 0,
    "exp": 0
}

 ```

The response contains the user's profile information including email, member ID, name, phone, address, role, points, balance, creation and update details, and token expiration information.
### Refresh Access Token

This endpoint is used to refresh the access token by providing the refresh token.

#### Request Body

- No request body is required for this endpoint.
    

#### Response

The response for this request is a JSON object with the following schema:

``` json
{
    "type": "object",
    "properties": {
        "status": {
            "type": "string"
        },
        "message": {
            "type": "string"
        },
        "data": {
            "type": "object",
            "properties": {
                "access_token": {
                    "type": "string"
                },
                "refresh_token": {
                    "type": "string"
                }
            }
        }
    }
}

 ```

