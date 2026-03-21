/**
 * Cloudflare Worker CORS Proxy for Bitbucket API
 *
 * Pure CORS forwarder -- does NOT store or inject tokens.
 * The browser sends the Authorization header and this proxy
 * passes it through to Bitbucket, adding CORS headers to responses.
 */

var ALLOWED_PATH_RE = /^2\.0\/(workspaces\/[^/]+\/search\/code|repositories\/[^/]+\/[^/]+(\/src\/.+)?)$/;

function isAllowedPath(path) {
  return ALLOWED_PATH_RE.test(path);
}

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
    'Vary': 'Origin'
  };
}

function errorResponse(status, message, env) {
  return new Response(JSON.stringify({ error: message }), {
    status: status,
    headers: Object.assign({ 'Content-Type': 'application/json' }, corsHeaders(env))
  });
}

function handleOptions(request, env) {
  var origin = request.headers.get('Origin');
  if (origin !== env.ALLOWED_ORIGIN) {
    return new Response('Forbidden', { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin'
    }
  });
}

export default {
  async fetch(request, env) {
    // Handle preflight
    if (request.method === 'OPTIONS') {
      return handleOptions(request, env);
    }

    // Only allow GET
    if (request.method !== 'GET') {
      return errorResponse(405, 'Method not allowed', env);
    }

    // Validate origin
    var origin = request.headers.get('Origin');
    if (origin !== env.ALLOWED_ORIGIN) {
      return errorResponse(403, 'Forbidden', env);
    }

    // Parse URL and extract path
    var url = new URL(request.url);
    var pathname = url.pathname;

    // Must start with /bitbucket/
    if (!pathname.startsWith('/bitbucket/')) {
      return errorResponse(404, 'Not found', env);
    }

    // Strip /bitbucket/ prefix to get the Bitbucket API path
    var bbPath = pathname.slice('/bitbucket/'.length);

    // Validate against whitelist
    if (!isAllowedPath(bbPath)) {
      return errorResponse(403, 'Path not allowed', env);
    }

    // Build target URL
    var bbUrl = 'https://api.bitbucket.org/' + bbPath + url.search;

    // Forward request with browser's Authorization header (pure passthrough)
    var headers = { 'Accept': 'application/json' };
    var authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    try {
      var response = await fetch(bbUrl, { headers: headers });
      var newHeaders = new Headers(response.headers);
      newHeaders.set('Access-Control-Allow-Origin', env.ALLOWED_ORIGIN);
      newHeaders.set('Vary', 'Origin');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    } catch (err) {
      return errorResponse(502, 'Upstream request failed', env);
    }
  }
};
