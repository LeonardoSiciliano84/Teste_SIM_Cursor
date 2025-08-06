import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Upload, Download, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Definição dos campos disponíveis para cada entidade
const FIELD_DEFINITIONS = {
  employees: {
    name: "Colaboradores",
    fields: [
      { key: "fullName", label: "Nome completo", type: "text", required: true },
      { key: "cpf", label: "CPF", type: "text", required: true },
      { key: "rg", label: "RG", type: "text", required: false },
      { key: "birthDate", label: "Data de nascimento", type: "date", required: false },
      { key: "phone", label: "Telefone", type: "text", required: true },
      { key: "email", label: "E-mail", type: "email", required: false },
      { key: "position", label: "Cargo", type: "text", required: true },
      { key: "department", label: "Departamento", type: "text", required: true },
      { key: "employeeNumber", label: "Matrícula", type: "text", required: true },
      { key: "admissionDate", label: "Data de admissão", type: "date", required: false },
      { key: "salary", label: "Salário", type: "number", required: false },
      { key: "address", label: "Endereço", type: "text", required: false },
      { key: "nationality", label: "Nacionalidade", type: "text", required: false },
      { key: "driverLicense", label: "CNH", type: "text", required: false },
      { key: "driverLicenseCategory", label: "Categoria CNH", type: "text", required: false },
      { key: "driverLicenseExpiry", label: "Vencimento CNH", type: "date", required: false }
    ]
  },
  vehicles: {
    name: "Frota",
    fields: [
      { key: "plate", label: "Placa", type: "text", required: true },
      { key: "brand", label: "Marca", type: "text", required: true },
      { key: "model", label: "Modelo", type: "text", required: true },
      { key: "manufactureYear", label: "Ano de fabricação", type: "number", required: true },
      { key: "modelYear", label: "Ano modelo", type: "number", required: true },
      { key: "chassis", label: "Chassi", type: "text", required: false },
      { key: "renavam", label: "RENAVAM", type: "text", required: false },
      { key: "vehicleType", label: "Tipo de veículo", type: "text", required: true },
      { key: "classification", label: "Classificação", type: "text", required: true },
      { key: "loadCapacity", label: "Capacidade de carga (kg)", type: "number", required: false },
      { key: "fuelTankCapacity", label: "Capacidade do tanque (L)", type: "number", required: false },
      { key: "fuelConsumption", label: "Consumo (km/L)", type: "number", required: false },
      { key: "preventiveMaintenanceKm", label: "Intervalo de revisão (km)", type: "number", required: false },
      { key: "purchaseDate", label: "Data de compra", type: "date", required: false },
      { key: "purchaseValue", label: "Valor de compra", type: "number", required: false },
      { key: "currentLocation", label: "Localização atual", type: "text", required: false }
    ]
  }
};

interface ImportResult {
  success: boolean;
  imported: number;
  errors: Array<{ row: number; error: string }>;
  skipped: number;
}

export default function DataImport() {
  const [selectedEntity, setSelectedEntity] = useState<string>("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const { toast } = useToast();

  const importMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await apiRequest(`/api/import/${selectedEntity}`, {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: (result: ImportResult) => {
      setImportResult(result);
      setShowResult(true);
      if (result.success && result.errors.length === 0) {
        toast({
          title: "Importação concluída",
          description: `${result.imported} registros importados com sucesso.`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro na importação",
        description: error.message || "Ocorreu um erro durante a importação.",
        variant: "destructive",
      });
    },
  });

  const handleEntityChange = (value: string) => {
    setSelectedEntity(value);
    setSelectedFields([]);
    setFile(null);
    setImportResult(null);
    setShowResult(false);
  };

  const handleFieldToggle = (fieldKey: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldKey) 
        ? prev.filter(key => key !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      setFile(selectedFile);
    } else {
      toast({
        title: "Arquivo inválido",
        description: "Selecione um arquivo .xlsx válido.",
        variant: "destructive",
      });
    }
  };

  const handleImport = () => {
    if (!file || !selectedEntity || selectedFields.length === 0) {
      toast({
        title: "Dados incompletos",
        description: "Selecione uma entidade, campos e um arquivo para importar.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fields', JSON.stringify(selectedFields));
    
    importMutation.mutate(formData);
  };

  const downloadTemplate = () => {
    if (!selectedEntity || selectedFields.length === 0) {
      toast({
        title: "Selecione os campos",
        description: "Escolha uma entidade e os campos antes de baixar o template.",
        variant: "destructive",
      });
      return;
    }

    // Criar um template de exemplo
    const entityFields = FIELD_DEFINITIONS[selectedEntity as keyof typeof FIELD_DEFINITIONS];
    const selectedFieldsData = entityFields.fields.filter(field => selectedFields.includes(field.key));
    
    const csvContent = selectedFieldsData.map(field => field.label).join(',');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template_${selectedEntity}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetImport = () => {
    setSelectedEntity("");
    setSelectedFields([]);
    setFile(null);
    setImportResult(null);
    setShowResult(false);
  };

  const entityFields = selectedEntity 
    ? FIELD_DEFINITIONS[selectedEntity as keyof typeof FIELD_DEFINITIONS]
    : null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Importação de Dados via Planilha</h1>
        <div className="text-sm text-gray-500">
          FELKA Transportes
        </div>
      </div>

      {!showResult ? (
        <div className="grid gap-6">
          {/* Step 1: Seleção da Entidade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                1. Selecione o Banco de Dados
              </CardTitle>
              <CardDescription>
                Escolha qual entidade você deseja importar dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedEntity} onValueChange={handleEntityChange} data-testid="select-entity">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma entidade para importar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employees">Colaboradores</SelectItem>
                  <SelectItem value="vehicles">Frota</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Step 2: Seleção dos Campos */}
          {entityFields && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  2. Selecione os Campos para Importação
                </CardTitle>
                <CardDescription>
                  Marque quais campos estarão presentes na sua planilha. Os campos obrigatórios estão marcados com *.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {entityFields.fields.map((field) => (
                    <div key={field.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={field.key}
                        checked={selectedFields.includes(field.key)}
                        onCheckedChange={() => handleFieldToggle(field.key)}
                        data-testid={`checkbox-${field.key}`}
                      />
                      <Label htmlFor={field.key} className="text-sm">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                    </div>
                  ))}
                </div>
                
                {selectedFields.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Cabeçalho da Planilha:</h4>
                    <p className="text-sm text-blue-700 font-mono">
                      {entityFields.fields
                        .filter(field => selectedFields.includes(field.key))
                        .map(field => field.label)
                        .join(' | ')
                      }
                    </p>
                    <div className="mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={downloadTemplate}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        data-testid="button-download-template"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Baixar Template
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Upload do Arquivo */}
          {selectedFields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  3. Upload da Planilha
                </CardTitle>
                <CardDescription>
                  Faça o upload do arquivo .xlsx com os dados para importação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept=".xlsx"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                      data-testid="input-file"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-gray-700">
                        Clique para selecionar arquivo .xlsx
                      </p>
                      <p className="text-sm text-gray-500">
                        Ou arraste e solte o arquivo aqui
                      </p>
                    </label>
                  </div>

                  {file && (
                    <Alert>
                      <FileText className="h-4 w-4" />
                      <AlertDescription>
                        Arquivo selecionado: <strong>{file.name}</strong>
                      </AlertDescription>
                    </Alert>
                  )}

                  {file && (
                    <div className="flex gap-4">
                      <Button 
                        onClick={handleImport} 
                        disabled={importMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                        data-testid="button-import"
                      >
                        {importMutation.isPending ? "Importando..." : "Importar Dados"}
                      </Button>
                      <Button variant="outline" onClick={resetImport} data-testid="button-reset">
                        Recomeçar
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress */}
          {importMutation.isPending && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Importando dados...</span>
                    <span>Processando arquivo</span>
                  </div>
                  <Progress value={50} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        /* Resultado da Importação */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {importResult?.success && importResult.errors.length === 0 ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              )}
              Resultado da Importação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{importResult?.imported || 0}</div>
                <div className="text-sm text-green-700">Registros Importados</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{importResult?.errors.length || 0}</div>
                <div className="text-sm text-yellow-700">Registros com Erro</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{importResult?.skipped || 0}</div>
                <div className="text-sm text-gray-700">Registros Ignorados</div>
              </div>
            </div>

            {importResult?.errors && importResult.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-700">Erros encontrados:</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {importResult.errors.map((error, index) => (
                    <div key={index} className="text-sm p-2 bg-red-50 rounded border-l-4 border-red-400">
                      <strong>Linha {error.row}:</strong> {error.error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button onClick={resetImport} className="bg-blue-600 hover:bg-blue-700" data-testid="button-new-import">
                Nova Importação
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}