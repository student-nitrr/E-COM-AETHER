import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function GenericPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const resolvedParams = await params;
  const pageName = (resolvedParams.slug || []).join(" ").replace(/-/g, " ");
  
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 md:py-32 text-center min-h-[60vh] flex flex-col items-center justify-center">
      <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6 capitalize">
        {pageName}
      </h1>
      <p className="text-foreground-secondary mb-10 max-w-lg">
        This is a placeholder page for <strong>{pageName}</strong>. 
        In a complete application, this would contain the actual content for this section.
      </p>
      
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Return to Homepage
      </Link>
    </div>
  );
}
