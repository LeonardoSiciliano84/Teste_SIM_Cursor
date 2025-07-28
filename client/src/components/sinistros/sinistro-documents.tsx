import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Image, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SinistroDocument {
  id: string;
  sinistroId: string;
  tipoDocumento: string;
  nomeArquivo: string;
  caminhoArquivo: string;
  tamanhoArquivo?: number;
  tipoMime?: string;
  uploadedBy: string;
  nomeUploader: string;
  createdAt: string;
}

interface SinistroDocumentsProps {
  sinistroId: string;
}

export default function SinistroDocuments({ sinistroId }: SinistroDocumentsProps) {
  const { data: documents = [], isLoading } = useQuery<SinistroDocument[]>({
    queryKey: ["/api/sinistros", sinistroId, "documents"],
  });

  const getDocumentIcon = (tipoMime?: string) => {
    if (!tipoMime) return <FileText className="w-4 h-4" />;
    if (tipoMime.startsWith('image/')) return <Image className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Tamanho desconhecido";
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  const getDocumentTypeBadge = (tipo: string) => {
    const typeConfig = {
      foto_local: { color: "bg-blue-100 text-blue-800", label: "Foto do Local" },
      brat: { color: "bg-green-100 text-green-800", label: "BRAT" },
      cat: { color: "bg-yellow-100 text-yellow-800", label: "CAT" },
      ficha_saude: { color: "bg-purple-100 text-purple-800", label: "Ficha de Saúde" },
      relatorio_qsms: { color: "bg-red-100 text-red-800", label: "Relatório QSMS" },
      checklist: { color: "bg-orange-100 text-orange-800", label: "Checklist" },
      outros: { color: "bg-gray-100 text-gray-800", label: "Outros" },
    };
    
    const config = typeConfig[tipo as keyof typeof typeConfig] || typeConfig.outros;
    return (
      <Badge variant="secondary" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const handleDownload = async (document: SinistroDocument) => {
    try {
      const response = await fetch(`/api/sinistros/${sinistroId}/documents/${document.id}/download`);
      if (!response.ok) {
        throw new Error('Erro ao baixar documento');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.download = document.nomeArquivo;
      window.document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao baixar documento:', error);
      alert('Erro ao baixar documento. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documentos Anexados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Carregando documentos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Documentos Anexados ({documents.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <AlertCircle className="w-4 h-4" />
            Nenhum documento anexado a este sinistro.
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3 flex-1">
                  {getDocumentIcon(doc.tipoMime)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate">{doc.nomeArquivo}</p>
                      {getDocumentTypeBadge(doc.tipoDocumento)}
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Tamanho: {formatFileSize(doc.tamanhoArquivo)}</p>
                      <p>Enviado por: {doc.nomeUploader}</p>
                      <p>Data: {format(new Date(doc.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(doc)}
                  title="Baixar documento"
                  className="ml-2"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}