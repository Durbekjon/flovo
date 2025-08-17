"use client";

import { IconTrophy, IconTrendingUp, IconPackage } from '@tabler/icons-react';

interface TopProductsProps {
  topProducts?: Array<{ name: string; count: number }>;
}

export function TopProducts({ topProducts }: TopProductsProps) {
  if (!topProducts || topProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <IconTrophy className="w-8 h-8 text-amber-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Top Products Yet</h3>
        <p className="text-gray-500 text-sm">
          Start receiving orders to see your best performing items
        </p>
      </div>
    );
  }

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return {
          bg: 'bg-gradient-to-br from-amber-400 to-orange-500',
          text: 'text-white',
          border: 'border-amber-200'
        };
      case 1:
        return {
          bg: 'bg-gradient-to-br from-gray-300 to-gray-400',
          text: 'text-white',
          border: 'border-gray-200'
        };
      case 2:
        return {
          bg: 'bg-gradient-to-br from-amber-600 to-orange-700',
          text: 'text-white',
          border: 'border-amber-300'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-600',
          border: 'border-gray-200'
        };
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <IconTrophy className="w-4 h-4" />;
      case 1:
        return <IconTrendingUp className="w-4 h-4" />;
      case 2:
        return <IconPackage className="w-4 h-4" />;
      default:
        return <span className="text-sm font-semibold">{index + 1}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {topProducts.map((product, index) => {
        const rankColor = getRankColor(index);
        const rankIcon = getRankIcon(index);
        const percentage = Math.round((product.count / topProducts[0].count) * 100);
        
        return (
          <div key={product.name} className="group relative">
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200 group-hover:border-gray-200">
              {/* Rank badge */}
              <div className={`w-10 h-10 ${rankColor.bg} ${rankColor.border} rounded-full flex items-center justify-center ${rankColor.text} flex-shrink-0 shadow-sm`}>
                {rankIcon}
              </div>
              
              {/* Product info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {product.name}
                  </h4>
                  <span className="text-sm font-medium text-gray-600">
                    {product.count} order{product.count > 1 ? 's' : ''}
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === 0 ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                      index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                      index === 2 ? 'bg-gradient-to-r from-amber-600 to-orange-700' :
                      'bg-gray-300'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    {percentage}% of top seller
                  </span>
                  {index === 0 && (
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                      Best Seller
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* View all products button */}
      <div className="pt-4">
        <a 
          href="/dashboard/products"
          className="block w-full text-center px-4 py-3 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-colors"
        >
          Manage all products →
        </a>
      </div>
    </div>
  );
}
