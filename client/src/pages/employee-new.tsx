import { useLocation } from "wouter";
import { EmployeeForm } from "@/components/employees/employee-form";

export function EmployeeNewPage() {
  const [, setLocation] = useLocation();

  const handleSuccess = () => {
    setLocation("/employees");
  };

  const handleCancel = () => {
    setLocation("/employees");
  };

  return (
    <EmployeeForm 
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}