export default {
  async fetch(request, env, ctx) {
    // 处理 OPTIONS 请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    if (request.method !== 'POST') {
      return corsify(new Response(JSON.stringify({ error: '方法不允许' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      }));
    }

    const url = new URL(request.url);
    
    try {
      let response;
      switch (url.pathname) {
        case '/api/user':
          response = await handleUser(request, env);
          break;
        case '/api/login':
          response = await handleLogin(request, env);
          break;
        case '/api/checklogin':
          response = await handleCheckLogin(request, env);
          break;
        default:
          response = new Response(JSON.stringify({ error: '未找到接口' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
      }
      return corsify(response);
    } catch (error) {
      return corsify(new Response(JSON.stringify({ error: '服务器错误' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }));
    }
  }
};

// 添加 CORS 头的辅助函数
function corsify(response) {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

async function handleUser(request, env) {
  try {
    const { token, userInfo } = await request.json();
    
    if (!token || !userInfo) {
      return new Response(JSON.stringify({ error: '参数不完整' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await env.USER_DB.put(`user:${token}`, JSON.stringify(userInfo));

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '处理用户信息失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleLogin(request, env) {
  try {
    const { code } = await request.json();
    
    const wxLoginUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${env.WX_APPID}&secret=${env.WX_SECRET}&js_code=${code}&grant_type=authorization_code`;
    const response = await fetch(wxLoginUrl);
    const data = await response.json();

    if (data.errcode) {
      return new Response(JSON.stringify({ error: '微信登录失败' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = crypto.randomUUID();
    await env.USER_DB.put(`session:${token}`, JSON.stringify(data));

    return new Response(JSON.stringify({ token }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '登录失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleCheckLogin(request, env) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return new Response(JSON.stringify({ error: '未提供token' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const sessionData = await env.USER_DB.get(`session:${token}`);
    
    return new Response(JSON.stringify({ 
      isValid: !!sessionData,
      sessionData: sessionData ? JSON.parse(sessionData) : null 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '验证登录态失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 