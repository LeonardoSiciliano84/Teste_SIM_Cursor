import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { EmployeeForm } from "@/components/employees/employee-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { type Employee } from "../types/mock";

export function EmployeeEditPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const { data: employee, isLoading } = useQuery<Employee>({
    queryKey: ["/api/employees", id],
    enabled: !!id,
  });

  const handleSuccess = () => {
    setLocation("/employees");
  };

  const handleCancel = () => {
    setLocation("/employees");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-felka-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados do colaborador...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Colaborador não encontrado</h2>
          <p className="text-gray-600 mt-2">O colaborador solicitado não existe ou foi removido.</p>
          <Button onClick={() => setLocation("/employees")} className="mt-4">
            Voltar para Lista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={handleCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Colaborador</h1>
          <p className="text-gray-600">{employee.fullName} - #{employee.employeeNumber}</p>
        </div>
      </div>

      {/* Form */}
      <EmployeeForm 
        employee={employee}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}