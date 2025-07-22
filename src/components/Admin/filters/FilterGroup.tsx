'use client'

import React,{ useState} from 'react'
import TimeFilter from './TimeFilter';
import RegionFilter, { District } from './RegionFilter'
import ManufactureFilter from './ManufactureFilter';

export interface HeatmapFilter {
    time: number;
    region: string;
    manufacture: string;
}

interface FilterGroupProps {
    onFilterChange: (filter: HeatmapFilter) => void;
}

export default function FilterGroup({onFilterChange }: FilterGroupProps) {
    const [filters, setFilters] = useState<HeatmapFilter>({
        time: 0, // 0시간후
        region: '부산시 전체',
        manufacture: '전체'
    });

    const handleChange = (key, value) => {
        const updated = {...filters, [key]: value};
        setFilters(updated);
        onFilterChange(updated); // 상위 컴포넌트에 전달
    }

    

    return (
        <div className='flex flex-col gap-6'>
            <div>
                <h3 className="font-bold text-gray-700 mb-2">시간 선택</h3>
                <TimeFilter value={filters.time} onTimeSelect={(val) => handleChange('time', val)} />
            </div>
                {/* <ManufactureFilter value={filters.manufacture} onManufactureSelect={(val) => handleChange('manufacture', val)} /> */}
            <div>
                <h3 className="font-bold text-gray-700 mb-2">지역 선택</h3>
                <RegionFilter value={filters.region} onRegionSelect={(val) => handleChange('region', val)} />
            </div>
        </div>
    )
}
