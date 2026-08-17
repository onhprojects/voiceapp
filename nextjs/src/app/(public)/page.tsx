import React from 'react';
import Link from 'next/link';
import {
  Mic,
  ShieldCheck,
  Clock,
  ArrowRight,
  Sparkles,
  Eraser,
  CheckCircle2,
  AudioLines,
  Eye,
  Lock,
  UserPlus,
  LogIn,
} from 'lucide-react';

export default function Home() {
  const stats = [
    { value: '75%', label: 'less time per intake' },
    { value: '3x', label: 'faster data entry' },
    { value: 'Hours', label: 'saved every week' },
    { value: '0', label: 'typing required' },
  ];

  const benefits = [
    {
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      title: 'Save hours every single day',
      description:
        'Speaking is far faster than typing. Intake Coordinators and staff can complete forms in a fraction of the time, freeing up hours each week to focus on clients rather than paperwork.',
    },
    {
      icon: AudioLines,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      title: 'Capture answers naturally',
      description:
        'Your speech is transcribed in real time as you talk. No more pausing to hunt for keys — just answer questions conversationally and watch the form fill itself in.',
    },
    {
      icon: Eraser,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      title: 'Edit anything in seconds',
      description:
        'Every transcription is fully editable before submission. Spoken exactly what you meant? Review, correct, and polish the text with a few quick clicks.',
    },
    {
      icon: Eye,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      title: 'Less strain, less burnout',
      description:
        'Reduce hours of repetitive typing that lead to wrist strain and fatigue. Staff stay comfortable, productive, and engaged throughout the day.',
    },
    {
      icon: CheckCircle2,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
      title: 'Fewer errors to redo',
      description:
        'Faster input means fewer missed fields and fewer mistakes. Live review catches errors on the spot, reducing the back-and-forth of corrections.',
    },
    {
      icon: Sparkles,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      title: 'Works everywhere',
      description:
        'A familiar form experience powered by speech — accessible from your browser on any device, ready whenever you are.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Log in & start an intake',
      description:
        'Sign in to your secure account and open a new intake assessment form.',
    },
    {
      number: '02',
      title: 'Press record & speak',
      description:
        'Answer each question by talking naturally — your words are transcribed in real time.',
    },
    {
      number: '03',
      title: 'Review & submit',
      description:
        'Quickly review the transcript, make any edits, and submit. Done in minutes.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary-50/70 via-white to-white" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6">
                <Mic className="h-4 w-4" />
                Demo · Speech-to-Text Intake Form
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                Complete intake forms by{' '}
                <span className="text-primary-600">just speaking</span>
              </h1>
              <p className="mt-6 text-xl text-gray-600 max-w-xl">
                A demonstration of a speech-to-text intake form that turns spoken answers
                into completed forms in minutes — helping Intake Coordinators and staff
                save hours of typing every week.
              </p>
              <div className="mt-10 flex gap-4 flex-wrap">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center px-6 py-3 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Register
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  Login
                </Link>
              </div>
              <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium">
                <ShieldCheck className="h-5 w-5" />
                Your information is private &amp; secure
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative">
              <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-tr from-primary-200/40 to-emerald-200/40 blur-2xl" />
              <div className="rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                  <span className="ml-3 text-sm text-gray-400 font-medium">Intake Assessment</span>
                </div>
                <div className="p-6 space-y-5">
                  {[
                    { q: 'What is your name?', a: 'Jordan Smith' },
                    { q: 'What services are you interested in?', a: 'Individual counseling' },
                    { q: 'Reason for today’s visit?', a: 'Feeling overwhelmed at work...' },
                  ].map((item) => (
                    <div key={item.q} className="rounded-xl border border-gray-100 p-4">
                      <p className="text-sm font-medium text-gray-700">{item.q}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <AudioLines className="h-4 w-4 text-primary-500" />
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full w-2/3 bg-gradient-to-r from-primary-400 to-emerald-400 rounded-full" />
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 italic">“{item.a}”</p>
                    </div>
                  ))}
                </div>
                <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-500">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Transcribing in real time
                  </span>
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                    02:14
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="py-12 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl md:text-5xl font-bold text-white">{stat.value}</p>
                <p className="mt-2 text-primary-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              Why speech-to-text is a game changer for intake
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Most people speak about 150 words per minute but type only about 40. That
              difference adds up to hours of saved time — for Intake Coordinators and
              every staff member completing forms.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className={`h-12 w-12 rounded-lg ${benefit.bg} flex items-center justify-center`}>
                  <benefit.icon className={`h-6 w-6 ${benefit.color}`} />
                </div>
                <h3 className="mt-4 text-xl font-semibold">{benefit.title}</h3>
                <p className="mt-2 text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">How it works</h2>
            <p className="mt-4 text-xl text-gray-600">
              Three simple steps from opening the form to submission.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="relative p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="text-5xl font-bold text-primary-200">{step.number}</div>
                <h3 className="mt-4 text-xl font-semibold flex items-center gap-2">
                  <Mic className="h-5 w-5 text-primary-600" />
                  {step.title}
                </h3>
                <p className="mt-2 text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy / HIPAA */}
      <section id="privacy" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-4">
                <Lock className="h-4 w-4" />
                Private by design
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Your information is private and secure
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                This demo takes your privacy seriously. All information you provide —
                including recorded and transcribed responses — is kept private and treated
                as confidential.
              </p>
              <p className="mt-4 text-lg text-gray-600">
                The platform is built to adhere to <strong>HIPAA regulations</strong>,
                helping organizations protect sensitive intake information with the
                security and compliance safeguards they expect.
              </p>
              <div className="mt-6 space-y-4">
                {[
                  'Data is kept private and accessible only to your account',
                  'Secure transmission and storage of sensitive information',
                  'Designed with HIPAA compliance in mind for healthcare intake',
                  'Your responses are never shared without authorization',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-gray-700">
                    <ShieldCheck className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">HIPAA-aware compliance</h3>
                  <p className="text-gray-500 text-sm">Privacy &amp; security you can trust</p>
                </div>
              </div>
              <ul className="mt-6 space-y-3">
                {[
                  'Confidential handling of spoken intake responses',
                  'Access limited to your secure account',
                  'Safe storage of sensitive information',
                  'Built for organizations handling protected health information',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-600">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to try the speech-to-text intake form?
          </h2>
          <p className="mt-4 text-xl text-primary-100">
            Create a free account and experience just how fast intake can be when you
            speak instead of type.
          </p>
          <div className="mt-8 flex gap-4 flex-wrap justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-white text-primary-600 font-medium hover:bg-primary-50 transition-colors"
            >
              <UserPlus className="mr-2 h-5 w-5" />
              Register
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center px-6 py-3 rounded-lg border border-white/40 text-white font-medium hover:bg-primary-700 transition-colors"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
