import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, BookOpen, CheckCircle2, ShieldCheck, Users } from 'lucide-react';

import { Alert } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { hasSupabaseConfig } from '@/lib/config';

import { LoginForm } from './login-form';

const accessNotes = [
  { title: 'Dirección', body: 'Administra usuarios, grados, alumnos y reportes.', icon: ShieldCheck },
  { title: 'Docentes', body: 'Revisa cursos, asistencia y carga académica.', icon: BookOpen },
  { title: 'Alumnos', body: 'Consulta avisos, calendario y seguimiento académico.', icon: Users }
];

export default function LoginPage() {
  const demoMode = !hasSupabaseConfig();

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[1440px] flex-col justify-center gap-6">
        <header className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <span className="flex size-12 items-center justify-center overflow-hidden rounded-md border border-border bg-white shadow-soft">
              <Image
                src="/canaan-logo.jpeg"
                alt="Logo del Centro Educativo Cristiano Canaán"
                width={48}
                height={48}
                className="size-full object-contain"
                priority
              />
            </span>
            <span className="text-sm font-bold text-foreground">Canaán Conecta</span>
          </Link>
          <Link className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted" href="/">
            <ArrowLeft className="size-4" aria-hidden />
            Volver
          </Link>
        </header>

        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <Card className="order-2 lg:order-1">
            <CardHeader>
              <CardTitle className="font-serif text-3xl">Ingresar</CardTitle>
              <CardDescription>Usa tu correo institucional para entrar al panel que corresponde a tu rol.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {demoMode ? (
                <div className="rounded-lg border border-primary/20 bg-primary/10 p-4 text-sm leading-6 text-foreground">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <div>
                      La versión de recorrido está disponible para revisar la experiencia completa.
                      <div className="mt-4">
                        <Link className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-canaan-celeste" href="/">
                          Entrar al modo demo
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
              <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-muted" />}>
                <LoginForm />
              </Suspense>
              <Alert>
                {demoMode ? (
                  <>El formulario queda visible para validar la interfaz; para explorar usa el modo demo.</>
                ) : (
                  <>La cuenta administradora debe estar habilitada por el colegio antes del primer ingreso.</>
                )}
              </Alert>
            </CardContent>
          </Card>

          <section className="order-1 rounded-lg border border-canaan-primary/30 bg-gradient-to-br from-canaan-primary to-canaan-celeste p-6 text-primary-foreground shadow-panel sm:p-8 lg:order-2">
            <p className="text-sm font-semibold text-primary-foreground/75">Centro Educativo Cristiano Canaán</p>
            <h1 className="mt-4 max-w-xl font-serif text-4xl leading-tight sm:text-5xl">
              Un acceso simple para toda la comunidad educativa.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-primary-foreground/80">
              La plataforma organiza cada sesión por rol para que cada usuario vea solo lo que necesita y pueda actuar rápido.
            </p>
            <div className="mt-8 grid gap-3">
              {accessNotes.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="flex gap-3 rounded-md border border-primary-foreground/20 bg-primary-foreground/10 p-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-foreground/20">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span>
                      <span className="block font-semibold">{item.title}</span>
                      <span className="block text-sm leading-6 text-primary-foreground/75">{item.body}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
