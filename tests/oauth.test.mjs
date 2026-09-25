import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
test('OAuth callback uses server-only token exchange',()=>{const code=readFileSync('app/api/tiendanube/callback/route.ts','utf8');assert.match(code,/exchangeCode/);assert.match(code,/saveInstallation/);assert.doesNotMatch(code,/NEXT_PUBLIC_/)});
test('installation status requires admin authentication',()=>{const code=readFileSync('app/api/tiendanube/status/route.ts','utf8');assert.match(code,/isAdmin/);assert.doesNotMatch(code,/access_token_encrypted/)});
