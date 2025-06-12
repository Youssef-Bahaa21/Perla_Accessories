# CSRF Protection Deployment Guide

## Overview
CSRF (Cross-Site Request Forgery) protection has been enabled for the Perla e-commerce application. This guide explains how to properly deploy and configure CSRF protection in production.

## Changes Made

### 1. Server-Side Changes
- **Enabled CSRF for all environments** unless explicitly disabled via `DISABLE_CSRF=true`
- **Enhanced CSRF middleware** with better error handling and token validation
- **Improved security configuration** with proper cookie settings and token expiration

### 2. Client-Side Changes
- **Updated CSRF interceptor** to use correct header name (`X-XSRF-TOKEN`)
- **Added CSRF service** for centralized token management
- **Integrated token initialization** in app startup

## Environment Configuration

### Production Environment Variables
```bash
# CSRF Configuration
DISABLE_CSRF=false                    # Set to 'true' only if you need to disable CSRF
NODE_ENV=production                   # Enables secure cookies

# Required for proper operation
FRONTEND_ORIGIN=https://yourdomain.com  # Your frontend URL
```

### Development Environment Variables
```bash
# CSRF Configuration (optional - enabled by default)
DISABLE_CSRF=false                    # Can be set to 'true' for testing
NODE_ENV=development                  # Uses non-secure cookies for localhost

# Frontend origin for CORS
FRONTEND_ORIGIN=http://localhost:4200
```

## Deployment Checklist

### ✅ Server Deployment
1. **Environment Variables**: Ensure `DISABLE_CSRF` is not set to `true` in production
2. **HTTPS Required**: CSRF cookies require HTTPS in production (`secure: true`)
3. **Cookie Configuration**: Verify SameSite and secure cookie settings
4. **CORS Setup**: Ensure frontend origin is properly configured

### ✅ Client Deployment
1. **Token Initialization**: CSRF token is fetched automatically on app start
2. **Interceptor Active**: All POST/PUT/DELETE/PATCH requests include CSRF token
3. **Error Handling**: Users will see proper error messages for CSRF failures

## Testing CSRF Protection

### 1. Verify Token Generation
```bash
# Should return a valid CSRF token
curl -X GET https://yourapi.com/api/csrf-token -c cookies.txt
```

### 2. Test Protected Endpoint
```bash
# Should fail without token
curl -X POST https://yourapi.com/api/auth/login -d '{"email":"test@test.com","password":"test"}'

# Should succeed with token (using browser/frontend)
```

### 3. Check Browser Developer Tools
- **Network Tab**: Verify `X-XSRF-TOKEN` header is sent with requests
- **Application Tab**: Check `XSRF-TOKEN` cookie is set
- **Console**: Look for CSRF initialization log message

## Troubleshooting

### Common Issues

#### 1. "Invalid CSRF token" Errors
**Symptoms**: 403 errors with "CSRF token validation failed"
**Solutions**:
- Refresh the browser to get a new token
- Check if cookies are being blocked
- Verify HTTPS is enabled in production
- Ensure `withCredentials: true` in HTTP requests

#### 2. Token Not Being Set
**Symptoms**: No `XSRF-TOKEN` cookie in browser
**Solutions**:
- Check server logs for CSRF initialization errors
- Verify `/api/csrf-token` endpoint is accessible
- Check CORS configuration
- Ensure cookies are not being blocked by browser settings

#### 3. Mixed Content Issues
**Symptoms**: CSRF not working on HTTPS site
**Solutions**:
- Ensure API server is also on HTTPS
- Check for mixed HTTP/HTTPS content
- Verify secure cookie settings

### Emergency Disable
If CSRF causes critical issues in production:
```bash
# Temporarily disable CSRF (NOT RECOMMENDED for long-term)
export DISABLE_CSRF=true
# Restart your application
```
**⚠️ Important**: Re-enable CSRF protection as soon as possible to maintain security.

## Security Benefits
- **Prevents CSRF attacks**: Malicious sites cannot make authenticated requests
- **Token-based validation**: Each request must include a valid token
- **Automatic token rotation**: Tokens expire and are refreshed automatically
- **Enhanced error handling**: Clear feedback when token validation fails

## Performance Impact
- **Minimal overhead**: Token validation adds ~1-2ms per request
- **Client-side caching**: Tokens are cached and reused
- **Optimized for SPA**: Works seamlessly with Angular's HttpClient

## Support
If you encounter issues with CSRF protection:
1. Check browser developer tools for errors
2. Verify server logs for CSRF-related messages
3. Test with the troubleshooting steps above
4. Consider temporarily disabling CSRF if critical issues arise (with proper security review) 