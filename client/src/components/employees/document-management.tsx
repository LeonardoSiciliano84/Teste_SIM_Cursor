import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, FileText, Upload, Download, Edit, Trash2, Plus, Calendar, Eye } from "lucide-react";
import { type EmployeeDocument, type InsertEmployeeDocument } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, isAfter, isBefore, addDays } from "date-fns";

interface DocumentManagementProps {
  employeeId: string;
  employeeName: string;
}

const DOCUMENT_TYPES = [
  "CNH",
  "CPF",
  "RG",
  "Carteira de Trabalho",
  "Comprovante de Residência",
  "Exame Médico",
  "Exame ASO",
  "Curso de Capacitação",
  "Certificado de Treinamento",
  "Comprovante de Escolaridade",
  "Atestado de Antecedentes",
  "Outros"
];

export function DocumentManagement({ employeeId, employeeName }: DocumentManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: documents = [], isLoading } = useQuery<EmployeeDocument[]>({
    queryKey: ["/api/employees", employeeId, "documents"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: { documentData: InsertEmployeeDocument; file: File }) => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('documentData', JSON.stringify(data.documentData));
      
      return await fetch(`/api/employees/${employeeId}/documents/upload`, {
        method: 'POST',
        body: formData,
      }).then(res => {
        if (!res.ok) throw new Error('Erro no upload');
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "documents"] });
      setIsAddDialogOpen(false);
      setSelectedFile(null);
      toast({
        title: "Sucesso",
        description: "Documento adicionado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao adicionar documento",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (documentId: string) => {
      return await apiRequest(`/api/employees/${employeeId}/documents/${documentId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "documents"] });
      toast({
        title: "Sucesso",
        description: "Documento removido com sucesso!",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verificar tamanho do arquivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "Arquivo muito grande. Máximo 5MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    if (!selectedFile) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo",
        variant: "destructive",
      });
      return;
    }

    const documentData: InsertEmployeeDocument = {
      employeeId,
      documentType: formData.get('documentType') as string,
      description: formData.get('description') as string,
      expiryDate: formData.get('expiryDate') ? new Date(formData.get('expiryDate') as string) : undefined,
      issuedDate: formData.get('issuedDate') ? new Date(formData.get('issuedDate') as string) : undefined,
      issuer: formData.get('issuer') as string || undefined,
      documentNumber: formData.get('documentNumber') as string || undefined,
    };

    uploadMutation.mutate({ documentData, file: selectedFile });
  };

  const getExpiryStatus = (expiryDate: Date | null) => {
    if (!expiryDate) return null;
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = addDays(today, 30);
    
    if (isBefore(expiry, today)) {
      return { status: 'expired', label: 'Vencido', variant: 'destructive' as const };
    } else if (isBefore(expiry, thirtyDaysFromNow)) {
      return { status: 'expiring', label: 'Vence em breve', variant: 'default' as const };
    }
    return { status: 'valid', label: 'Válido', variant: 'secondary' as const };
  };

  const downloadDocument = async (documentId: string, filename: string) => {
    try {
      const response = await fetch(`/api/employees/${employeeId}/documents/${documentId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao baixar documento",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-felka-blue"></div>
      </div>
    );
  }

  const expiredDocs = documents.filter(doc => {
    if (!doc.expiryDate) return false;
    return isBefore(new Date(doc.expiryDate), new Date());
  });

  const expiringDocs = documents.filter(doc => {
    if (!doc.expiryDate) return false;
    const expiry = new Date(doc.expiryDate);
    const today = new Date();
    const thirtyDaysFromNow = addDays(today, 30);
    return isAfter(expiry, today) && isBefore(expiry, thirtyDaysFromNow);
  });

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Documentos de {employeeName}</h3>
          <p className="text-sm text-gray-600">Gerencie documentos pessoais e profissionais</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" style={{ backgroundColor: '#0C29AB', color: 'white' }}>
              <Plus className="w-4 h-4" />
              Adicionar Documento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Documento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="documentType">Tipo de Documento *</Label>
                <Select name="documentType" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Input
                  name="description"
                  placeholder="Ex: CNH Categoria B"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentNumber">Número do Documento</Label>
                <Input
                  name="documentNumber"
                  placeholder="Ex: 123456789"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="issuedDate">Data de Emissão</Label>
                  <Input
                    name="issuedDate"
                    type="date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Data de Vencimento</Label>
                  <Input
                    name="expiryDate"
                    type="date"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="issuer">Órgão Emissor</Label>
                <Input
                  name="issuer"
                  placeholder="Ex: DETRAN-SP"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Arquivo *</Label>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  required
                />
                <p className="text-xs text-gray-500">
                  Formatos aceitos: PDF, JPG, PNG. Máximo 5MB.
                </p>
                {selectedFile && (
                  <p className="text-sm text-green-600">
                    Arquivo selecionado: {selectedFile.name}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={uploadMutation.isPending}
                  className="flex-1"
                  style={{ backgroundColor: '#0C29AB', color: 'white' }}
                >
                  {uploadMutation.isPending ? 'Enviando...' : 'Adicionar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alert Cards */}
      {(expiredDocs.length > 0 || expiringDocs.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {expiredDocs.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold">Documentos Vencidos ({expiredDocs.length})</span>
                </div>
                <p className="text-sm text-red-600 mt-1">
                  Há documentos que precisam ser renovados urgentemente
                </p>
              </CardContent>
            </Card>
          )}
          
          {expiringDocs.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Calendar className="w-5 h-5" />
                  <span className="font-semibold">Vencendo em breve ({expiringDocs.length})</span>
                </div>
                <p className="text-sm text-yellow-600 mt-1">
                  Documentos que vencem nos próximos 30 dias
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documentos ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum documento cadastrado</p>
              <p className="text-sm">Comece adicionando o primeiro documento</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Número</TableHead>
                    <TableHead>Emissão</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => {
                    const expiryStatus = getExpiryStatus(doc.expiryDate);
                    return (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.documentType}</TableCell>
                        <TableCell>{doc.description}</TableCell>
                        <TableCell>{doc.documentNumber || '-'}</TableCell>
                        <TableCell>
                          {doc.issuedDate ? format(new Date(doc.issuedDate), 'dd/MM/yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          {doc.expiryDate ? format(new Date(doc.expiryDate), 'dd/MM/yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          {expiryStatus && (
                            <Badge variant={expiryStatus.variant}>
                              {expiryStatus.label}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadDocument(doc.id, doc.filename || 'documento')}
                              title="Baixar arquivo"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteMutation.mutate(doc.id)}
                              title="Remover documento"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}