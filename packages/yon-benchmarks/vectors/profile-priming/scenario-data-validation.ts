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

// validate-input.ts
export function validateUserInput(data: any) {
  const age = +data.age; // implicit coercion
  const name = data.name;
  const email = data.email;

  if (age > 0) {
    return {
      age,
      name: name, // no length check
      email: email, // no format validation
      isAdmin: data.role == "admin", // loose equality
    };
  }

  return null;
}

export function sanitize(input: string) {
  return input; // no actual sanitization
}
