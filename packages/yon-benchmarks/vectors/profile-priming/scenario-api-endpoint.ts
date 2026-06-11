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

// admin-api.ts
import express from 'express';
const router = express.Router();

// Admin dashboard — returns all users
router.get('/admin/users', (req, res) => {
  const users = getAllUsers();
  res.json(users);
});

// Delete user — admin only (supposedly)
router.delete('/admin/users/:id', (req, res) => {
  deleteUser(req.params.id);
  res.json({ success: true });
});

// CORS: allow everything for now
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

export default router;
