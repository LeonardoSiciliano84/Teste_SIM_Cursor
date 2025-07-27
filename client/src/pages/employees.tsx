import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  AlertTriangle,
  Users,
  FileText,
  Calendar,
  Settings
} from "lucide-react";
import { type Employee, type EmployeeDocument } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const { data: expiringDocs = [] } = useQuery<EmployeeDocument[]>({
    queryKey: ["/api/employees/documents/expiring"],
  });

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.employeeNumber.includes(searchTerm) ||
                         employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === "all" || 
                         (selectedFilter === "active" && employee.status === "active") ||
                         (selectedFilter === "inactive" && employee.status === "inactive");
    
    return matchesSearch && matchesFilter;
  });

  const departmentStats = employees.reduce((acc, emp) => {
    if (emp.status === "active") {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const activeEmployees = employees.filter(emp => emp.status === "active").length;
  const inactiveEmployees = employees.filter(emp => emp.status === "inactive").length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Colaboradores</h1>
          <p className="text-gray-600">Cadastro e gerenciamento completo de funcionários</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar Dados
          </Button>
          <Link href="/employees/new">
            <Button className="gap-2 bg-felka-blue hover:bg-felka-blue/90 text-white">
              <Plus className="h-4 w-4" />
              Novo Colaborador
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Colaboradores Ativos</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{activeEmployees}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Colaboradores Inativos</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{inactiveEmployees}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-gray-600">Documentos Vencendo</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{expiringDocs.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Departamentos</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{Object.keys(departmentStats).length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, matrícula, departamento ou cargo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedFilter === "all" ? "default" : "outline"}
                onClick={() => setSelectedFilter("all")}
                size="sm"
              >
                Todos ({employees.length})
              </Button>
              <Button
                variant={selectedFilter === "active" ? "default" : "outline"}
                onClick={() => setSelectedFilter("active")}
                size="sm"
              >
                Ativos ({activeEmployees})
              </Button>
              <Button
                variant={selectedFilter === "inactive" ? "default" : "outline"}
                onClick={() => setSelectedFilter("inactive")}
                size="sm"
              >
                Inativos ({inactiveEmployees})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="grid" className="space-y-6">
        <TabsList>
          <TabsTrigger value="grid">Visualização em Grade</TabsTrigger>
          <TabsTrigger value="table">Visualização em Lista</TabsTrigger>
          <TabsTrigger value="departments">Por Departamento</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map((employee) => (
              <Card key={employee.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-felka-blue/10 rounded-full flex items-center justify-center">
                        <span className="text-felka-blue font-semibold">
                          {employee.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{employee.fullName}</h3>
                        <p className="text-sm text-gray-600">#{employee.employeeNumber}</p>
                      </div>
                    </div>
                    <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                      {employee.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Cargo:</span>
                      <span className="font-medium">{employee.position}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Departamento:</span>
                      <span className="font-medium">{employee.department}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Admissão:</span>
                      <span className="font-medium">
                        {employee.admissionDate ? new Date(employee.admissionDate).toLocaleDateString('pt-BR') : 'N/A'}
                      </span>
                    </div>
                    {employee.phone && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Telefone:</span>
                        <span className="font-medium">{employee.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/employees/${employee.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Ver Detalhes
                      </Button>
                    </Link>
                    <Link href={`/employees/edit/${employee.id}`}>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="table" className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Colaborador
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cargo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Departamento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admissão
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEmployees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-felka-blue/10 rounded-full flex items-center justify-center mr-3">
                              <span className="text-felka-blue font-semibold text-sm">
                                {employee.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{employee.fullName}</div>
                              <div className="text-sm text-gray-500">#{employee.employeeNumber}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.position}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.admissionDate ? new Date(employee.admissionDate).toLocaleDateString('pt-BR') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                            {employee.status === "active" ? "Ativo" : "Inativo"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <Link href={`/employees/${employee.id}`}>
                              <Button variant="outline" size="sm">Ver</Button>
                            </Link>
                            <Link href={`/employees/edit/${employee.id}`}>
                              <Button variant="outline" size="sm">Editar</Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(departmentStats).map(([department, count]) => (
              <Card key={department}>
                <CardHeader>
                  <CardTitle className="text-lg">{department}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-felka-blue mb-2">{count}</div>
                  <p className="text-sm text-gray-600">colaboradores ativos</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredEmployees.length === 0 && searchTerm && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum colaborador encontrado</h3>
            <p className="text-gray-600 mb-4">
              Não foi possível encontrar colaboradores com os filtros aplicados.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setSelectedFilter("all");
              }}
            >
              Limpar Filtros
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}