import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { CryptoIcon, DualCryptoIcon } from "@/components/ui/crypto-icon";
import { storageOperations } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TransactionsTableProps {
  limit?: number;
  showViewAll?: boolean;
}

export default function TransactionsTable({ limit, showViewAll = false }: TransactionsTableProps) {
  const displayedOperations = limit ? storageOperations.slice(0, limit) : storageOperations;
  
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  const getOperationLabel = (type: string) => {
    const labels: Record<string, string> = {
      'provision': 'Provision',
      'deallocate': 'Deallocate',
      'migrate': 'Migrate',
      'replicate': 'Replicate',
      'failover': 'Failover',
      'expand': 'Expand',
    };
    return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getOperationColor = (type: string) => {
    const colors: Record<string, string> = {
      'provision': 'bg-cyan-100 text-cyan-800',
      'deallocate': 'bg-red-100 text-red-800',
      'migrate': 'bg-indigo-100 text-indigo-800',
      'replicate': 'bg-purple-100 text-purple-800',
      'failover': 'bg-orange-100 text-orange-800',
      'expand': 'bg-green-100 text-green-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Recent Storage Operations</h2>
        {showViewAll && (
          <Link href="/history">
            <Button variant="link" className="text-blue-600 hover:text-blue-700 text-sm font-medium p-0 h-auto">
              View All
            </Button>
          </Link>
        )}
      </div>
      
      <Card className="bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operation</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Storage Tier</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayedOperations.map((op) => (
                <tr key={op.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="outline" className={getOperationColor(op.type)}>
                      {getOperationLabel(op.type)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {(op.type === 'migrate' || op.type === 'replicate') && op.fromTier && op.toTier ? (
                        <div className="flex-shrink-0 h-6 w-6 flex">
                          <img className="h-6 w-6 rounded-full" src={op.fromTier.icon} alt={op.fromTier.symbol} />
                          <img className="h-6 w-6 rounded-full -ml-2" src={op.toTier.icon} alt={op.toTier.symbol} />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 h-6 w-6">
                          <img className="h-6 w-6 rounded-full" src={op.tier.icon} alt={op.tier.symbol} />
                        </div>
                      )}
                      
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {(op.type === 'migrate' || op.type === 'replicate') && op.fromTier && op.toTier 
                            ? `${op.fromTier.symbol} → ${op.toTier.symbol}`
                            : `${op.tier.name} (${op.tier.symbol})`
                          }
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-mono ${
                      op.type === 'deallocate' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {op.type === 'deallocate' ? '-' : '+'}{op.capacityTB} TB
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatRelativeTime(op.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="outline" className={`
                      ${op.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                      ${op.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${op.status === 'failed' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {op.status.charAt(0).toUpperCase() + op.status.slice(1)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
