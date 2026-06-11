import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete('sb-access-token', { path: '/' });
  cookies.delete('sb-refresh-token', { path: '/' });
  cookies.delete('demo-role', { path: '/' });
  cookies.delete('demo-name', { path: '/' });
  cookies.delete('demo-email', { path: '/' });
  return redirect('/login');
};
