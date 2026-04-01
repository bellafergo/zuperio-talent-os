import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";

import { getCandidateCvPrintData } from "@/lib/candidates/get-candidate-cv-print-data";

import { CandidateCvDocument } from "@/app/(app)/candidates/_components/candidate-cv-document";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CandidateCvPrintPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const data = await getCandidateCvPrintData(id);
  if (!data) notFound();

  return (
    <div className="bg-white px-6 py-8 print:px-0 print:py-0">
      <CandidateCvDocument data={data} hideHint />
    </div>
  );
}
