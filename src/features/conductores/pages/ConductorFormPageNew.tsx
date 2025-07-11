import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, Save, User, Calendar as CalendarIcon, Phone, Mail, CreditCard, Badge as BadgeIcon } from "lucide-react";

// Componentes UI
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Hooks y servicios
import { useConductores } from "../hooks/useConductores";
import { fetchConductorById } from "../services/conductoresService";
import type { CreateConductorDto, UpdateConductorDto } from "@/api";

// Esquema de validación con Zod
const conductorSchema = z.object({
  nombre: z.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres"),
  dni: z.string()
    .min(7, "El DNI debe tener al menos 7 dígitos")
    .max(8, "El DNI no puede exceder 8 dígitos")
    .regex(/^\d+$/, "El DNI debe contener solo números"),
  email: z.string()
    .email("Email inválido")
    .optional()
    .or(z.literal("")),
  telefono: z.string().optional(),
  claseLicencia: z.string()
    .min(1, "Debe seleccionar una clase de licencia"),
  vencimientoLicencia: z.date({
    message: "La fecha de vencimiento es requerida",
  }).refine((date) => date > new Date(), {
    message: "La fecha de vencimiento debe ser futura",
  }),
});

type ConductorFormData = z.infer<typeof conductorSchema>;

const clasesLicencia = [
  { value: "A", label: "Clase A - Motocicletas" },
  { value: "B", label: "Clase B - Automóviles" },
  { value: "C", label: "Clase C - Camiones pequeños" },
  { value: "D", label: "Clase D - Transporte de pasajeros" },
  { value: "E", label: "Clase E - Camiones grandes" },
];

export const ConductorFormPageNew = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  
  const { createNewConductor, updateExistingConductor } = useConductores();
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ConductorFormData>({
    resolver: zodResolver(conductorSchema),
    defaultValues: {
      nombre: "",
      dni: "",
      email: "",
      telefono: "",
      claseLicencia: "",
      vencimientoLicencia: undefined,
    },
  });

  // Cargar datos del conductor si estamos editando
  useEffect(() => {
    if (isEditing && id) {
      loadConductorData(parseInt(id));
    }
  }, [id, isEditing]);

  const loadConductorData = async (conductorId: number) => {
    try {
      setLoadingData(true);
      const conductor = await fetchConductorById(conductorId);
      
      form.reset({
        nombre: conductor.nombre || "",
        dni: conductor.dni || "",
        email: conductor.email || "",
        telefono: conductor.telefono || "",
        claseLicencia: conductor.claseLicencia || "",
        vencimientoLicencia: conductor.vencimientoLicencia 
          ? new Date(conductor.vencimientoLicencia)
          : undefined,
      });
    } catch (err) {
      setError("Error al cargar los datos del conductor");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (data: ConductorFormData) => {
    setLoading(true);
    setError(null);

    try {
      if (isEditing && id) {
        const updateData: UpdateConductorDto = {
          idConductor: parseInt(id),
          nombre: data.nombre.trim(),
          dni: data.dni.trim(),
          email: data.email?.trim() || "",
          telefono: data.telefono?.trim() || "",
          claseLicencia: data.claseLicencia.trim(),
          vencimientoLicencia: data.vencimientoLicencia
        };
        
        const success = await updateExistingConductor(parseInt(id), updateData);
        if (success) {
          navigate("/conductores");
        }
      } else {
        const createData: CreateConductorDto = {
          nombre: data.nombre.trim(),
          dni: data.dni.trim(),
          email: data.email?.trim() || "",
          telefono: data.telefono?.trim() || "",
          claseLicencia: data.claseLicencia.trim(),
          vencimientoLicencia: data.vencimientoLicencia
        };
        
        const success = await createNewConductor(createData);
        if (success) {
          navigate("/conductores");
        }
      }
    } catch (err) {
      setError(isEditing ? "Error al actualizar el conductor" : "Error al crear el conductor");
    } finally {
      setLoading(false);
    }
  };

  const isLicenseExpiringSoon = (date: Date) => {
    const today = new Date();
    const daysUntilExpiry = Math.ceil((date.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const getLicenseStatusBadge = (date: Date) => {
    const today = new Date();
    const daysUntilExpiry = Math.ceil((date.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysUntilExpiry < 0) {
      return { variant: "destructive" as const, text: "Vencida" };
    } else if (daysUntilExpiry <= 30) {
      return { variant: "secondary" as const, text: "Por vencer" };
    } else {
      return { variant: "default" as const, text: "Vigente" };
    }
  };

  const formatPhoneNumber = (value: string) => {
    return value.replace(/\D/g, '');
  };

  const getQuickDateOptions = () => {
    return [1, 2, 3, 5].map(years => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + years);
      return {
        years,
        date: futureDate,
        label: `+${years} año${years > 1 ? 's' : ''}`
      };
    });
  };

  if (loadingData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/conductores")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/conductores")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Conductores
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <User className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? "Editar Conductor" : "Nuevo Conductor"}
          </h1>
          <p className="text-gray-600">
            {isEditing ? "Modifica los datos del conductor" : "Completa la información del nuevo conductor"}
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Nombre */}
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Nombre y apellido *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Juan Pérez" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="conductor@ejemplo.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* DNI */}
                <FormField
                  control={form.control}
                  name="dni"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        DNI *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          maxLength={8}
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            if (value.length <= 8) {
                              field.onChange(value);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Teléfono */}
                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Teléfono
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="tel"
                          {...field}
                          onChange={(e) => {
                            const formatted = formatPhoneNumber(e.target.value);
                            field.onChange(formatted);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Clase de Licencia */}
                <FormField
                  control={form.control}
                  name="claseLicencia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <BadgeIcon className="h-4 w-4" />
                        Clase de Licencia *
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar clase de licencia" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clasesLicencia.map((clase) => (
                            <SelectItem key={clase.value} value={clase.value}>
                              {clase.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Vencimiento de Licencia */}
                <FormField
                  control={form.control}
                  name="vencimientoLicencia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        Vencimiento de Licencia *
                      </FormLabel>
                      
                      {/* Sugerencias de fechas rápidas */}
                      {!field.value && (
                        <div className="mb-2">
                          <FormDescription className="mb-2">Fechas comunes:</FormDescription>
                          <div className="flex flex-wrap gap-2">
                            {getQuickDateOptions().map(({ years, date, label }) => (
                              <Button
                                key={years}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => field.onChange(date)}
                                className="h-8 px-3 text-xs"
                              >
                                {label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={`w-full pl-3 text-left font-normal ${
                                !field.value && "text-muted-foreground"
                              }`}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: es })
                              ) : (
                                <span>Seleccionar fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>

                      {/* Estado de la licencia */}
                      {field.value && (
                        <div className="mt-2 space-y-2">
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="text-sm text-blue-800">
                              <strong>Fecha seleccionada:</strong> {format(field.value, "PPPP", { locale: es })}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge {...getLicenseStatusBadge(field.value)}>
                              {getLicenseStatusBadge(field.value).text}
                            </Badge>
                            
                            {field.value < new Date() ? (
                              <span className="text-red-600 text-sm">La licencia está vencida</span>
                            ) : isLicenseExpiringSoon(field.value) ? (
                              <span className="text-yellow-600 text-sm">
                                Vence en {Math.ceil((field.value.getTime() - new Date().getTime()) / (1000 * 3600 * 24))} días
                              </span>
                            ) : (
                              <span className="text-green-600 text-sm">
                                Vigente hasta {format(field.value, "PP", { locale: es })}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/conductores")}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    "Guardando..."
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditing ? "Actualizar" : "Crear"} Conductor
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
    </div>
  );
};
