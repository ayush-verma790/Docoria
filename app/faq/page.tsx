"use client"

import { SiteHeader } from "@/components/site-header"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Search, HelpCircle } from "lucide-react"

export default function FAQPage() {
  const faqs = [
    {
      category: "General",
      questions: [
        { q: "Is Docorio really free?", a: "Yes, Docorio is completely free to use. We believe in providing accessible tools for everyone. There are no hidden fees or subscriptions." },
        { q: "Do I need to create an account?", a: "No account is required for any of our standard tools. You can convert, edit, and sign documents anonymously." },
      ]
    },
    {
      category: "Security & Privacy",
      questions: [
        { q: "Are my files safe?", a: "We prioritize client-side processing, meaning your files are processed directly on your device whenever possible. If server processing is needed, files are encrypted and automatically deleted immediately after use." },
        { q: "Do you sell my data?", a: "Never. We do not sell or share your document data or personal information with third parties." },
      ]
    },
    {
      category: "Technical",
      questions: [
        { q: "What file formats do you support?", a: "We support PDF, Word (DOCX), Excel (XLSX), PowerPoint (PPTX), JPG, PNG, WebP, and HTML." },
        { q: "Why did my conversion fail?", a: "Conversions might fail if the file is corrupted, password-protected, or extremely large. Try checking the file integrity and try again." },
        { q: "What's the maximum file size I can upload?", a: "For most tools, we support files up to 2GB. However, browser memory limits may vary depending on your device." },
        { q: "Can I use Docorio on mobile?", a: "Yes, our website is fully responsive and works great on iPhone, iPad, and Android devices." },
        { q: "Do you support batch processing?", a: "Yes, you can upload multiple files at once for tools like Merge, Compress, and PDF to JPG." },
        { q: "Is there a limit to how many files I can process?", a: "No, Docorio is unlimited. You can process as many documents as you need." },
        { q: "How long are my files stored?", a: "Files processed in the browser (Merge, Split, Compress) are never stored. Files sent to the server for conversion are deleted immediately after processing." },
        { q: "Can I edit text in a scanned PDF?", a: "Yes, use our OCR/Scanner tool to extract text from scanned images and then edit it." },
        { q: "Does Docorio work offline?", a: "Yes, if you keep the tab open, many tools (like Merge and Split) will continue to work even if you lose internet connection." },
        { q: "How do I print a PDF?", a: "After processing, download the file and use your device's standard print dialog (Ctrl+P or Cmd+P)." },
      ]
    },
    {
      category: "Tools & Features",
      questions: [
        { q: "How do I merge PDF files?", a: "Go to the Merge tool, upload your files, drag to reorder them, and click 'Merge PDF'." },
        { q: "How do I split a PDF?", a: "Use the Split tool. You can select specific pages to keep or extract ranges (e.g., pages 1-5)." },
        { q: "Can I rotate just one page?", a: "Yes, in the Rotate or Organize tool, you can rotate individual pages or the entire document." },
        { q: "How do I reduce PDF file size?", a: "Use the Compress tool. It optimizes images and fonts to reduce size by up to 80%." },
        { q: "Can I convert Word to PDF?", a: "Yes, upload your .docx file to the Converter tool and select PDF as the output." },
        { q: "Can I convert PDF to Word?", a: "Yes, we can convert PDF back to editable Word documents." },
        { q: "How do I sign a PDF?", a: "Use the Sign tool to draw your signature, type your name, or upload an image of your signature." },
        { q: "How do I watermark a PDF?", a: "Use the Watermark tool to add text or image stamps to your pages." },
        { q: "Can I remove a password from a PDF?", a: "Yes, if you know the password, you can use the Unlock tool to permanently remove it." },
        { q: "Can I add page numbers?", a: "Yes, the Page Numbers tool lets you add custom numbering to the header or footer." },
        { q: "How do I extract images from a PDF?", a: "Use the Extract Images tool to save all embedded photos as separate JPG/PNG files." },
        { q: "Can I turn a webpage into a PDF?", a: "Yes, use the HTML to PDF tool. Just paste the URL." },
        { q: "How do I crop a PDF?", a: "The Crop tool allows you to trim the white margins off your pages." },
        { q: "Can I enhance a scanned document?", a: "Yes, our Scanner tool can improve contrast and turn gray scans into crisp black and white." },
        { q: "Do you have an API?", a: "We are working on a developer API. Contact us for early access." },
      ]
    },
    {
      category: "Troubleshooting",
      questions: [
        { q: "Why is my PDF blank after processing?", a: "This is rare. Try reloading the page and processing the file again. Ensure your original file is not corrupted." },
        { q: "Why can't I upload my file?", a: "Check if your internet connection is stable. Also, ensure the file is not password protected before uploading (unless using the Unlock tool)." },
        { q: "The text formatting looks wrong after conversion.", a: "PDF to Word conversion is complex. Complex layouts with many tables may require manual adjustment." },
        { q: "My signature looks pixelated.", a: "Try drawing your signature larger or uploading a high-resolution image of it." },
        { q: "I forgot my PDF password. Can you open it?", a: "No. For security reasons, we cannot crack unknown passwords. We can only remove passwords if you provide the correct one first." },
        { q: "The download button isn't working.", a: "Try disabling ad blockers or checking your browser's download settings." },
        { q: "Why does compression take so long?", a: "Large files with many high-res images take longer to process. Please be patient." },
        { q: "Can I undelete a file?", a: "No. Once a file is deleted from our servers or your browser session, it is gone forever for your privacy." },
        { q: "How do I clear my browser cache?", a: "Press Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac) and select 'Cached images and files'." },
        { q: "Is there a desktop app?", a: "Not yet, but you can 'Install' Docorio as a PWA (Progressive Web App) in Chrome/Edge for a native-like experience." },
      ]
    },
    {
      category: "Legal & Billing",
      questions: [
        { q: "Is this permitted for commercial use?", a: "Yes, you can use Docorio for business documents." },
        { q: "Do you offer enterprise support?", a: "Currently we are a self-service platform. For custom enterprise solutions, please contact sales." },
        { q: "Are electronic signatures legal?", a: "Yes, in most jurisdictions (including US and EU), electronic signatures are legally binding for most business contracts." },
        { q: "How do I report a bug?", a: "Please email our support team with details and screenshots." },
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-purple-500/30 selection:text-white">
      <SiteHeader />
      
      <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16 space-y-4">
            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto text-purple-500 mb-6">
                <HelpCircle size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">How can we help?</h1>
            <p className="text-xl text-muted-foreground">Find answers to common questions about Docorio.</p>
            
            <div className="max-w-md mx-auto relative pt-8">
                <Search className="absolute left-4 top-11 text-muted-foreground w-5 h-5" />
                <Input placeholder="Search for answers..." className="h-12 pl-12 rounded-xl bg-card border-border/50 focus:border-purple-500" />
            </div>
        </div>

        <div className="space-y-12">
            {faqs.map((section) => (
                <div key={section.category}>
                    <h2 className="text-2xl font-bold mb-6 text-foreground/80">{section.category}</h2>
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {section.questions.map((item, i) => (
                            <AccordionItem key={i} value={`${section.category}-${i}`} className="bg-card border border-border/50 rounded-xl px-6 data-[state=open]:border-purple-500/50 transition-all">
                                <AccordionTrigger className="text-lg font-medium py-6 hover:no-underline">{item.q}</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-base">
                                    {item.a}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            ))}
        </div>
      </div>
    </div>
  )
}
