import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/use-auth";

interface UseAdminEmployeesReturn {
  employees: Employee[];
  loading: boolean;
  error: Error | null;
  fetchEmployees: (filters?: EmployeeFilters) => Promise<void>;
  createEmployee: (employeeData: Partial<Employee>, password?: string) => Promise<Employee>;
  updateEmployee: (
    id: string,
    employeeData: Partial<Employee>
  ) => Promise<Employee>;
  deleteEmployee: (id: string) => Promise<boolean>;
  getEmployeeById: (id: string) => Promise<Employee>;
  isAuthorized: boolean;
}

/**
 * Custom hook for managing employees with admin authorization using Supabase
 */
export const useAdminEmployees = (): UseAdminEmployeesReturn => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, isAdmin } = useAuth();

  const generateSecurePassword = (length: number = 12): string => {
    const upperCaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const specialChars = '!@#$%^&*';
    const allChars = upperCaseChars + lowerCaseChars + numberChars + specialChars;
    
    let password = '';
    // Ensure at least one of each type
    password += upperCaseChars[Math.floor(Math.random() * upperCaseChars.length)];
    password += lowerCaseChars[Math.floor(Math.random() * lowerCaseChars.length)];
    password += numberChars[Math.floor(Math.random() * numberChars.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };
  

  // Fetch all employees with optional filters
  const fetchEmployees = useCallback(
    async (filters: EmployeeFilters = {}) => {
      if (!isAdmin) {
        setError(new Error("Unauthorized: Admin access required"));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Start building the query
        let query = supabase
          .from("employees")
          .select(
            `
          *,
          branches:branch_id (*)
        `
          )
          .order("last_name");

        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === "branch_id") {
              query = query.eq("branch_id", value);
            } else if (key === "status") {
              query = query.eq("status", value);
            } else if (key === "role") {
              query = query.eq("role", value);
            }
          }
        });

        const { data, error: supabaseError } = await query;

        if (supabaseError) {
          throw supabaseError;
        }

        setEmployees(data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        console.error("Failed to fetch employees:", err);
      } finally {
        setLoading(false);
      }
    },
    [isAdmin]
  );

  // Create a new employee
// In hooks/use-employees.tsx

const createEmployee = useCallback(
  async (employeeData: Partial<Employee>, password?: string): Promise<Employee> => {
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    try {
      setLoading(true);
      let authUserId: string | null | undefined = null;

      // First, check if an employee with this email already exists
      if (employeeData.email) {
        const { data: existingEmployee, error: checkError } = await supabase
          .from("employees")
          .select("*")
          .eq("email", employeeData.email)
          .single();

        if (existingEmployee) {
          throw new Error("An employee with this email already exists");
        }

        try {
          const employeePassword = password || generateSecurePassword();

          const { data: authData, error: authError } =
            await supabase.auth.signUp({
              email: employeeData.email,
              password: employeePassword,
              options: {
                data: {
                  firstName: employeeData.first_name,
                  lastName: employeeData.last_name,
                  full_name: `${employeeData.first_name} ${employeeData.last_name}`,
                  phone: employeeData.phone,
                  user_role: employeeData.role
                },
              },
            });

          if (!authError) {
            authUserId = authData?.user?.id;
          } else {
            throw new Error(authError.message);
          }
        } catch (authErr) {
          throw new Error(`Failed to create auth user: ${authErr}`);
        }
      }

      // Create employee record in the database
      const { data, error: supabaseError } = await supabase
        .from("employees")
        .insert([
          {
            ...employeeData,
            auth_id: authUserId,
            created_at: new Date(),
          },
        ])
        .select();

      if (supabaseError) {
        // If employee creation fails but auth user was created, try to delete the auth user
        if (authUserId) {
          await supabase.auth.admin.deleteUser(authUserId);
        }
        throw supabaseError;
      }

      const newEmployee = data[0] as Employee;
      setEmployees((prevEmployees) => [...prevEmployees, newEmployee]);
      return newEmployee;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      console.error("Failed to create employee:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  },
  [isAdmin]
);

  // Update an existing employee
  const updateEmployee = useCallback(
    async (id: string, employeeData: Partial<Employee>): Promise<Employee> => {
      if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }

      try {
        setLoading(true);

        // Get current employee data to check for auth_id
        const { data: existingEmployee, error: fetchError } = await supabase
          .from("employees")
          .select("*")
          .eq("id", id)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        // Try to update auth user email if it's changed
        if (
          existingEmployee.auth_id &&
          employeeData.email &&
          existingEmployee.email !== employeeData.email
        ) {
          try {
            const { error: authUpdateError } =
              await supabase.auth.admin.updateUserById(existingEmployee.auth_id, {
                email: employeeData.email,
              });

            if (authUpdateError) {
              console.warn("Failed to update auth user email, continuing with employee update:", authUpdateError);
            }
          } catch (authErr) {
            console.warn("Auth user update failed, continuing with employee update:", authErr);
          }
        }

        // Update employee record
        const { data, error: supabaseError } = await supabase
          .from("employees")
          .update({ ...employeeData, updated_at: new Date() })
          .eq("id", id)
          .select();

        if (supabaseError) {
          throw supabaseError;
        }

        const updatedEmployee = data[0] as Employee;
        setEmployees((prevEmployees) =>
          prevEmployees.map((employee) =>
            employee.id === id ? updatedEmployee : employee
          )
        );
        return updatedEmployee;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        console.error("Failed to update employee:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin]
  );

  // Delete an employee
  const deleteEmployee = useCallback(
    async (id: string): Promise<boolean> => {
      if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }

      try {
        setLoading(true);

        // Get employee to check if there's an associated auth user
        const { data: employee, error: fetchError } = await supabase
          .from("employees")
          .select("*")
          .eq("id", id)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        // Try to delete the associated auth user if exists
        if (employee.auth_id) {
          try {
            const { error: authDeleteError } =
              await supabase.auth.admin.deleteUser(employee.auth_id);

            if (authDeleteError) {
              console.warn("Failed to delete auth user, continuing with employee deletion:", authDeleteError);
            }
          } catch (authErr) {
            console.warn("Auth user deletion failed, continuing with employee deletion:", authErr);
          }
        }

        // Delete employee record
        const { error: supabaseError } = await supabase
          .from("employees")
          .delete()
          .eq("id", id);

        if (supabaseError) {
          throw supabaseError;
        }

        setEmployees((prevEmployees) =>
          prevEmployees.filter((employee) => employee.id !== id)
        );
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        console.error("Failed to delete employee:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin]
  );

  // Get a single employee by ID
  const getEmployeeById = useCallback(
    async (id: string): Promise<Employee> => {
      if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required");
      }

      try {
        setLoading(true);
        const { data, error: supabaseError } = await supabase
          .from("employees")
          .select(
            `
          *,
          branches:branch_id (*)
        `
          )
          .eq("id", id)
          .single();

        if (supabaseError) {
          throw supabaseError;
        }

        return data as Employee;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
        console.error(`Failed to get employee with id ${id}:`, err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin]
  );

  // Initialize by fetching employees on first load
  useEffect(() => {
    if (isAdmin) {
      fetchEmployees();
    }
  }, [fetchEmployees, isAdmin]);

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeById,
    isAuthorized: isAdmin,
  };
};