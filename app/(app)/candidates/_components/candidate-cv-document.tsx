import type { CandidateCvPrintData } from "@/lib/candidates/get-candidate-cv-print-data";

import "./candidate-cv-document.css";

function groupSkillsByCategory(
  skills: CandidateCvPrintData["structuredSkills"],
): { category: string; items: CandidateCvPrintData["structuredSkills"] }[] {
  const map = new Map<string, CandidateCvPrintData["structuredSkills"]>();
  for (const s of skills) {
    const list = map.get(s.category) ?? [];
    list.push(s);
    map.set(s.category, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, items]) => ({ category, items }));
}

export function CandidateCvDocument({
  data,
  hideHint = false,
}: {
  data: CandidateCvPrintData;
  hideHint?: boolean;
}) {
  const today = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const skillGroups = groupSkillsByCategory(data.structuredSkills);

  return (
    <div className="cv-print-root space-y-3">
      {!hideHint ? (
        <p className="cv-no-print text-xs text-muted-foreground">
          Zuperio CV template — use{" "}
          <span className="font-medium text-foreground">Download PDF</span> from
          the proposal email tab or candidate tools.
        </p>
      ) : null}
      <article
        className="cv-print-sheet mx-auto max-w-[720px] px-8 py-10"
        aria-label="Candidate CV"
      >
        <header className="border-b border-[var(--cv-border)] pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[0.65rem] font-semibold tracking-[0.28em] text-muted-foreground uppercase">
                Zuperio
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                Candidate profile
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Structured CV · deterministic layout
              </p>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p className="font-medium text-foreground">{today}</p>
              <p>Ref. {data.id.slice(0, 8)}</p>
            </div>
          </div>
        </header>

        <section className="mt-6">
          <h3 className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
            Identity
          </h3>
          <p className="mt-2 text-lg font-semibold text-foreground">
            {data.fullName}
          </p>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Role</dt>
              <dd className="font-medium text-foreground">{data.role}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Senioridad
              </dt>
              <dd className="font-medium text-foreground">
                {data.seniorityLabel}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Availability
              </dt>
              <dd className="text-foreground">{data.availabilityLabel}</dd>
            </div>
            {data.currentCompany ? (
              <div>
                <dt className="text-xs font-medium text-muted-foreground">
                  Current company
                </dt>
                <dd className="text-foreground">{data.currentCompany}</dd>
              </div>
            ) : null}
            {data.email ? (
              <div>
                <dt className="text-xs font-medium text-muted-foreground">
                  Email
                </dt>
                <dd className="break-all text-foreground">{data.email}</dd>
              </div>
            ) : null}
            {data.phone ? (
              <div>
                <dt className="text-xs font-medium text-muted-foreground">
                  Phone
                </dt>
                <dd className="text-foreground">{data.phone}</dd>
              </div>
            ) : null}
          </dl>
        </section>

        {skillGroups.length > 0 ? (
          <section className="mt-8 space-y-5">
            <h3 className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
              Structured skills
            </h3>
            {skillGroups.map((g) => (
              <div key={g.category}>
                <p className="text-xs font-semibold text-foreground">
                  {g.category}
                </p>
                <table className="mt-2">
                  <thead>
                    <tr>
                      <th>Skill</th>
                      <th className="w-[100px]">Years</th>
                      <th className="w-[120px]">Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.items.map((s) => (
                      <tr key={s.name}>
                        <td className="font-medium text-foreground">{s.name}</td>
                        <td className="tabular-nums text-muted-foreground">
                          {s.yearsExperience != null ? s.yearsExperience : "—"}
                        </td>
                        <td className="text-muted-foreground">
                          {s.level ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </section>
        ) : null}

        {data.legacySkillsText ? (
          <section className="mt-8">
            <h3 className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
              Legacy skills summary
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-foreground">
              {data.legacySkillsText}
            </p>
          </section>
        ) : null}

        {data.placements.length > 0 ? (
          <section className="mt-8">
            <h3 className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
              Experience (placements)
            </h3>
            <table className="mt-3">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Role</th>
                  <th>Period</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.placements.map((p, i) => (
                  <tr key={`${p.companyName}-${i}`}>
                    <td className="font-medium text-foreground">
                      {p.companyName}
                    </td>
                    <td className="text-muted-foreground">{p.roleTitle}</td>
                    <td className="whitespace-nowrap text-xs text-muted-foreground">
                      {p.startLabel} — {p.endLabel}
                    </td>
                    <td className="text-xs text-muted-foreground">
                      {p.statusLabel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : (
          <section className="mt-8">
            <h3 className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
              Experience
            </h3>
            <p className="mt-2 text-xs text-muted-foreground">
              No placement history recorded yet. Current company is shown above
              when available.
            </p>
          </section>
        )}

        {data.notes ? (
          <section className="mt-8">
            <h3 className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
              Notes
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-foreground">
              {data.notes}
            </p>
          </section>
        ) : null}
      </article>
    </div>
  );
}
