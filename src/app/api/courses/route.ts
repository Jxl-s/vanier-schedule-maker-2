import { NextRequest } from 'next/server'
 
export async function GET(request: NextRequest) {
  // This API route should not be indexed
  return new Response('API routes are not meant to be accessed directly', {
    status: 404,
    headers: {
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}
