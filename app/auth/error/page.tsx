import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error_description: string; error: string }>
}) {
  const params = await searchParams
  const errorDesc = params?.error_description
    ? decodeURIComponent(params.error_description)
    : null

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-destructive">
                Authentication Failed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {errorDesc ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{errorDesc}</p>
                  {errorDesc.includes('Unable to exchange external code') && (
                    <div className="bg-muted p-3 rounded-lg text-xs space-y-2">
                      <p className="font-medium text-foreground">Troubleshooting:</p>
                      <ol className="list-decimal ml-4 space-y-1 text-muted-foreground">
                        <li>Go to <Link href="https://console.cloud.google.com/apis/credentials" className="text-primary underline" target="_blank">Google Cloud Console</Link> and verify your OAuth Client ID & Secret</li>
                        <li>Go to <Link href="https://supabase.com/dashboard/project/voejjjsthsmxpkqjpphi/auth/providers" className="text-primary underline" target="_blank">Supabase Auth Providers</Link> and make sure the Client ID & Secret match exactly</li>
                        <li>Ensure the redirect URI in Google Cloud matches: <code className="bg-background px-1">https://voejjjsthsmxpkqjpphi.supabase.co/auth/v1/callback</code></li>
                        <li>If you regenerated the secret, update it in Supabase Dashboard</li>
                      </ol>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  An unspecified error occurred.
                </p>
              )}
              <div className="flex gap-2 pt-2">
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">Back to Login</Button>
                </Link>
                <Link href="/">
                  <Button variant="ghost" size="sm">Home</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
