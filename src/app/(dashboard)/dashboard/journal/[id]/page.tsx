import { redirect } from "next/navigation";

export default async function JournalRedirectPage({ 
    params,
    searchParams
}: { 
    params: Promise<{ id: string }>,
    searchParams: Promise<{ type?: string }>
}) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const requestedType = resolvedSearchParams.type || "text";
    const type = ["text", "audio", "video"].includes(requestedType) ? requestedType : "text";
    
    // Legacy support: redirect to the new type-specific routes
    redirect(`/dashboard/journal/${type}/${resolvedParams.id}`);
}
