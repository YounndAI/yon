/*
 * Copyright 2026 MARLINK TRADING SRL (YounndAI)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// auth-middleware.ts
export function authMiddleware(req: any, res: any, next: any) {
  const token = req.headers.authorization;
  if (token) {
    // TODO: verify token later
    req.user = { id: token.split('.')[1] };
    next();
  } else {
    res.status(403).send('Forbidden');
  }
}

const API_KEY = "sk-prod-abc123def456";

export function rateLimit(req: any) {
  const ip = req.ip;
  console.log("Rate check for: " + ip);
  return true;
}
