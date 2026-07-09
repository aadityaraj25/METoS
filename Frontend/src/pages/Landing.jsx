import React from 'react'

const stats = [
    { label: 'Purpose', value: 'Smart India Hackathon 2026' },
    { label: 'Teams', value: 'Join & Collaborate' },
    { label: 'Focus', value: 'Idea Matching' },
]

const Landing = () => {
    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16 sm:px-8 lg:px-10">
                <header className="mb-12 flex items-center justify-between text-sm text-slate-500">
                    <div className="font-semibold">METoS</div>
                    <a href="/login" className="rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-100">
                        Login
                    </a>
                </header>

                <section className="space-y-8 rounded-3xl border border-slate-200 bg-white p-10 shadow-sm shadow-slate-200/70 sm:p-14">
                    <div className="space-y-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Smart India Hackathon</p>
                        <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
                            Find the perfect team match for your hackathon idea.
                        </h1>
                        <p className="max-w-2xl text-base leading-8 text-slate-600">
                            METoS helps innovators and developers connect, organize, and prepare for the Smart India Hackathon.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <a
                            href="/login"
                            className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
                        >
                            Join a team
                        </a>
                        <a
                            href="#overview"
                            className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:w-auto"
                        >
                            How it works
                        </a>
                    </div>
                </section>

                <section id="overview" className="mt-12 grid gap-4 sm:grid-cols-3">
                    {stats.map((item) => (
                        <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm shadow-slate-200/60">
                            <p className="font-semibold text-slate-900">{item.value}</p>
                            <p className="mt-2 text-slate-500">{item.label}</p>
                        </div>
                    ))}
                </section>

                <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-10 shadow-sm shadow-slate-200/60">
                    <h2 className="text-2xl font-semibold text-slate-950">How it works</h2>
                    <div className="mt-6 space-y-4 text-slate-600 sm:flex sm:gap-4 sm:space-y-0">
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                            <p className="text-sm font-semibold text-slate-900">1. Create your profile</p>
                            <p className="mt-2 text-sm leading-6">Share your skills and hackathon goals in a simple profile format.</p>
                        </div>
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                            <p className="text-sm font-semibold text-slate-900">2. Browse ideas</p>
                            <p className="mt-2 text-sm leading-6">Explore team opportunities and idea pitches from other participants.</p>
                        </div>
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                            <p className="text-sm font-semibold text-slate-900">3. Connect instantly</p>
                            <p className="mt-2 text-sm leading-6">Reach out instantly and start building your project with the right teammates.</p>
                        </div>
                    </div>
                </section>

                <footer className="mt-16 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
                    Made for Smart India Hackathon teams. Minimal, fast, and ready for collaboration.
                </footer>
            </div>
        </main>
    )
}

export default Landing
