import assert from 'node:assert/strict';
import test from 'node:test';

import {
  accessStatusToHttp,
  evaluateGuardianAccess,
  GUARDIAN_CAPABILITIES,
  resolveSelectedStudentId,
  studentResourceKey,
  validateGuardianLinkCreation,
} from '../src/lib/guardian/access.ts';

const guardian = {
  id: 'guardian-1',
  role: 'padre_encargado',
  schoolId: 'school-1',
  active: true,
};

const student = {
  id: 'student-1',
  schoolId: 'school-1',
  active: true,
};

const activeLink = {
  guardianId: guardian.id,
  studentId: student.id,
  status: 'active' as const,
};

test('un encargado con un alumno asignado puede consultarlo', () => {
  assert.equal(evaluateGuardianAccess({ guardian, student, link: activeLink }), 'allowed');
});

test('un encargado con dos alumnos puede alternar entre ambos', () => {
  assert.equal(resolveSelectedStudentId(['student-1', 'student-2'], 'student-2', null), 'student-2');
  assert.equal(resolveSelectedStudentId(['student-1', 'student-2'], 'student-1', null), 'student-1');
});

test('la selección soporta más de dos alumnos', () => {
  assert.equal(
    resolveSelectedStudentId(['student-1', 'student-2', 'student-3', 'student-4'], 'student-4', null),
    'student-4',
  );
});

test('un alumno no asignado produce forbidden', () => {
  assert.equal(evaluateGuardianAccess({ guardian, student, link: null }), 'forbidden');
});

test('un studentId manipulado se traduce a HTTP 403', () => {
  const status = evaluateGuardianAccess({
    guardian,
    student,
    link: { ...activeLink, studentId: 'student-other' },
  });
  assert.equal(accessStatusToHttp(status), 403);
});

test('el rol encargado es de solo lectura académica', () => {
  assert.equal(GUARDIAN_CAPABILITIES.readAssignedStudentData, true);
  assert.equal(GUARDIAN_CAPABILITIES.editGrades, false);
  assert.equal(GUARDIAN_CAPABILITIES.editAttendance, false);
  assert.equal(GUARDIAN_CAPABILITIES.editAcademicData, false);
  assert.equal(GUARDIAN_CAPABILITIES.manageLinks, false);
  assert.equal(GUARDIAN_CAPABILITIES.accessAdmin, false);
});

test('un administrador puede crear un vínculo válido', () => {
  assert.equal(
    validateGuardianLinkCreation({
      guardianRole: 'padre_encargado',
      guardianSchoolId: 'school-1',
      studentSchoolId: 'school-1',
      duplicate: false,
    }),
    'allowed',
  );
});

test('no se puede duplicar una vinculación', () => {
  assert.equal(
    validateGuardianLinkCreation({
      guardianRole: 'padre_encargado',
      guardianSchoolId: 'school-1',
      studentSchoolId: 'school-1',
      duplicate: true,
    }),
    'duplicate',
  );
});

test('no se puede vincular entre colegios diferentes', () => {
  assert.equal(
    validateGuardianLinkCreation({
      guardianRole: 'padre_encargado',
      guardianSchoolId: 'school-1',
      studentSchoolId: 'school-2',
      duplicate: false,
    }),
    'cross_school',
  );
});

test('desactivar una relación revoca el acceso inmediatamente', () => {
  assert.equal(
    evaluateGuardianAccess({ guardian, student, link: { ...activeLink, status: 'inactive' } }),
    'forbidden',
  );
});

test('cada alumno usa una clave de recurso distinta y no reutiliza datos anteriores', () => {
  assert.notEqual(
    studentResourceKey('student-1', 'dashboard'),
    studentResourceKey('student-2', 'dashboard'),
  );
});

test('el último alumno se restaura solo si continúa asignado', () => {
  assert.equal(resolveSelectedStudentId(['student-1', 'student-2'], null, 'student-2'), 'student-2');
  assert.equal(resolveSelectedStudentId(['student-1'], null, 'student-2'), 'student-1');
});

test('una cuenta sin alumnos no tiene selección', () => {
  assert.equal(resolveSelectedStudentId([], null, 'student-old'), null);
});

test('usuarios bloqueados, alumnos inactivos y otros roles no obtienen acceso', () => {
  assert.equal(evaluateGuardianAccess({ guardian: { ...guardian, active: false }, student, link: activeLink }), 'forbidden');
  assert.equal(evaluateGuardianAccess({ guardian, student: { ...student, active: false }, link: activeLink }), 'not_found');
  assert.equal(evaluateGuardianAccess({ guardian: { ...guardian, role: 'admin' }, student, link: activeLink }), 'forbidden');
  assert.equal(evaluateGuardianAccess({ guardian: { ...guardian, role: 'profesor' }, student, link: activeLink }), 'forbidden');
});
