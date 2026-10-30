import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { academicStages, formatAcademicLabel, stagesForSchool } from '../src/lib/academic-levels.ts';

test('las etiquetas paraguayas conservan los identificadores originales', () => {
  assert.equal(formatAcademicLabel('3.º EEB A'), '3.º grado A');
  assert.equal(formatAcademicLabel('1.º Nivel Medio'), '1.º curso · Educación Media');
  assert.equal(formatAcademicLabel('10.º grado'), '1.º curso · Educación Media');
  assert.equal(formatAcademicLabel('Reunión de 3.º y 4.º EEB'), 'Reunión de 3.º y 4.º grado');
  assert.equal(formatAcademicLabel('Inicial 5'), 'Inicial 5');
});

test('el catálogo cubre ciclos y ofrece solo niveles habilitados por colegio y año', () => {
  assert.deepEqual(academicStages.filter((stage) => stage.level === 'eeb').map((stage) => stage.cycle), [1, 1, 1, 2, 2, 2, 3, 3, 3]);
  const offerings = [{ stageId: '3eeb', schoolId: 'a', schoolYear: 2026, section: 'A' }, { stageId: '1em', schoolId: 'b', schoolYear: 2026, section: 'A' }];
  assert.deepEqual(stagesForSchool(offerings, 'a', 2026).map((stage) => stage.id), ['3eeb']);
  assert.deepEqual(stagesForSchool(offerings, 'a', 2027), []);
});
