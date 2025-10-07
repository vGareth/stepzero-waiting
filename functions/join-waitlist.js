export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    
    // Parse the request body
    const body = await request.json();
    const { firstName, email } = body;

    // --- Turnstile verification (ADD THIS) ---
    // Expect token in body as 'cf-turnstile-response' or 'turnstileToken'
    const token = body['cf-turnstile-response'] || body.turnstileToken || '';
    if (!token) {
      return new Response(JSON.stringify({ error: 'Bot check failed (missing token)' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }
    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET,
        response: token,
        // (optionally) remoteip: context.request.headers.get('cf-connecting-ip') || ''
      }),
    });
    const outcome = await verifyRes.json();
    if (!outcome.success) {
      return new Response(JSON.stringify({ error: 'Bot check failed' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }
    // --- End Turnstile verification ---
    
    // Validate input
    if (!firstName || !email) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Insert into D1 database
    const timestamp = new Date().toISOString();
    await env.DB.prepare(
      'INSERT INTO waitlist (first_name, email, timestamp) VALUES (?, ?, ?)'
    )
      .bind(firstName, email, timestamp)
      .run();
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error processing waitlist signup:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
