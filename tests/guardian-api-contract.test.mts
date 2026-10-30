import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const migrationPath = new URL('../supabase/migrations/0005_guardian_multistudent.sql', import.meta.url);
const guardianServerPath = new URL('../src/lib/guardian/server.ts', import.meta.url);
const moduleRoutePath = new URL(
  '../src/app/api/guardian/students/[studentId]/[module]/route.ts',
  import.meta.url,
);
const dashboardRoutePath = new URL(
  '../src/app/api/guardian/students/[studentId]/dashboard/route.ts',
  import.meta.url,
);
const adminCreateRoutePath = new URL(
  '../src/app/api/admin/guardians/[guardianId]/students/route.ts',
  import.meta.url,
);

test('la migración define relación única, colegio y estado del vínculo', async () => {
  const sql = await readFile(migrationPath, 'utf8');
  assert.match(sql, /unique \(guardian_user_id, student_id\)/);
  assert.match(sql, /guardian_school <> student_school/);
  assert.match(sql, /gs\.status = 'active'/);
  assert.match(sql, /student\.activo = true/);
});

test('la autorización backend distingue 401, 403 y 404 sin aceptar school_id del cliente', async () => {
  const server = await readFile(guardianServerPath, 'utf8');
  assert.match(server, /apiError\(401/);
  assert.match(server, /apiError\(403/);
  assert.match(server, /apiError\(404/);
  assert.doesNotMatch(server, /request.*school_id|searchParams.*school_id/i);
});

test('todos los módulos con studentId cargan primero un alumno autorizado', async () => {
  const [moduleRoute, dashboardRoute] = await Promise.all([
    readFile(moduleRoutePath, 'utf8'),
    readFile(dashboardRoutePath, 'utf8'),
  ]);
  assert.match(moduleRoute, /loadAuthorizedStudent\(auth\.session, studentId\)/);
  assert.match(dashboardRoute, /loadAuthorizedStudent\(auth\.session, studentId\)/);
});

test('las mutaciones de vinculaciones exigen una sesión admin y rechazan duplicados', async () => {
  const route = await readFile(adminCreateRoutePath, 'utf8');
  assert.match(route, /requireApiSession\(\['admin'\]\)/);
  assert.match(route, /apiError\(409/);
  assert.match(route, /school_id/);
});

test('RLS del encargado es de solo lectura y las mutaciones quedan reservadas a Dirección', async () => {
  const sql = await readFile(migrationPath, 'utf8');
  assert.match(sql, /guardian_reads_student_grades[\s\S]*for select/);
  assert.match(sql, /guardian_reads_student_attendance[\s\S]*for select/);
  const guardianPolicies = [
    ...sql.matchAll(/create policy "(guardian[^"]+)"([\s\S]*?);/g),
  ];
  assert.ok(guardianPolicies.length >= 8);
  for (const [, policyName, policyBody] of guardianPolicies) {
    assert.match(policyBody, /for select/i, `${policyName} debe ser de solo lectura`);
  }
  assert.match(sql, /admin_manages_guardian_links[\s\S]*for all/);
});
