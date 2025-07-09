import { Edit2, Trash2, Mail, Phone, User } from 'lucide-react';;
import type { ClienteDto } from "../types";

interface ClienteCardProps {
  cliente: ClienteDto;
  onEdit: () => void;
  onDelete: () => void;
}

export const ClienteCard = ({ cliente, onEdit, onDelete }: ClienteCardProps) => (
    <div key={cliente.idCliente} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{cliente.nombre}</h3>
                  <p className="text-sm text-gray-600">ID: {cliente.idCliente}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={onEdit}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={onDelete}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{cliente.email}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{cliente.telefono}</span>
              </div>
            </div>
          </div>
);

