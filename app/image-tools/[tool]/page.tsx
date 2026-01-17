import ImageToolClient from "./image-tool-client"

export function generateStaticParams() {
  return [
    { tool: "bg-remover" },
    { tool: "passport" },
    { tool: "resize" },
    { tool: "compress" },
    { tool: "profile" },
    { tool: "crop" },
    { tool: "id-card" },
    { tool: "blur" },
  ]
}

export default function ImageToolPage({ params }: { params: { tool: string } }) {
  return <ImageToolClient tool={params.tool} />
}
