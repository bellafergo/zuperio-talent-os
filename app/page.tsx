export default function Home() {
  const menuItems = [
    "Dashboard",
    "Companies",
    "Contacts",
    "Opportunities",
    "Vacancies",
    "Candidates",
    "Active Employees",
    "Weekly Logs",
  ];

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="border-b border-slate-200 px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Zuperio
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Talent OS
            </h1>
          </div>

          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item}>
                  <button
                    className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                      item === "Dashboard"
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <section className="flex flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Internal platform</p>
                <h2 className="text-xl font-semibold tracking-tight">
                  Dashboard
                </h2>
              </div>

              <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                Fernanda · Admin
              </div>
            </div>
          </header>

          <div className="flex-1 p-6">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Active Opportunities</p>
                <p className="mt-3 text-3xl font-semibold">12</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Open Vacancies</p>
                <p className="mt-3 text-3xl font-semibold">8</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Active Employees</p>
                <p className="mt-3 text-3xl font-semibold">15</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Pending Weekly Logs</p>
                <p className="mt-3 text-3xl font-semibold">4</p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Pipeline Overview</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Placeholder dashboard section for opportunities and vacancies.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Prospecting</p>
                    <p className="mt-2 text-2xl font-semibold">5</p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">In Progress</p>
                    <p className="mt-2 text-2xl font-semibold">4</p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Negotiation</p>
                    <p className="mt-2 text-2xl font-semibold">3</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold">Next Actions</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  <li className="rounded-xl bg-slate-50 p-3">
                    Follow up with candidate shortlist for Java vacancy
                  </li>
                  <li className="rounded-xl bg-slate-50 p-3">
                    Review pending weekly logs for Sigma team
                  </li>
                  <li className="rounded-xl bg-slate-50 p-3">
                    Update opportunity stage for new retail account
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}