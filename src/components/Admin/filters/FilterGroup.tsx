'use client'

import React,{ useState} from 'react'
import TimeFilter from './TimeFilter';
import RegionFilter, { District } from './RegionFilter'
import Calender from '@/components/Calender/Calender';

export interface HeatmapFilter {
    time: number;
    region: string;
    date: Date;
}

interface FilterGroupProps {
    onFilterChange: (filter: HeatmapFilter) => void;
}

export default function FilterGroup({onFilterChange }: FilterGroupProps) {
    const [filters, setFilters] = useState<HeatmapFilter>({ // 초기값
        time: 0, // 0시간후
        region: '부산시 전체',
        date: new Date(),
    });
    const [showDate, setShowDate] = useState<boolean>(false);

    // 필터적용
    const handleChange = (key, value) => {
        const updated = {...filters, [key]: value};
        setFilters(updated);
        // console.log(updated);
    }

    // 백에 요청
    const handleFetchData = () => {
        onFilterChange(filters); 
    }


    // 달력닫기
    const handleCloseDate = (date: Date) => {
        setShowDate(false);
    }
    

    return (
        <div className='flex flex-col gap-6'>
            <div className='textlst outside'>
                <h3 className="textlst title">지역</h3>
                <RegionFilter value={filters.region} onRegionSelect={(val) => handleChange('region', val)} />
            </div>

            <div className='flex'>
                <div className='textlst outside '>
                    <h3 className='textlst title'>날짜</h3>
                    <span className='cursor-pointer font-bold hover:bg-[#f2f2f2] py-1 rounded-md'
                            onClick={()=>setShowDate(true)}
                    >
                        {filters.date.toLocaleDateString()}
                    </span>
                </div>
                {showDate &&
                    <Calender 
                        selectedDate={filters.date} 
                        onSelectDate={(date) => handleChange('date', date)} 
                        handleTimeslots={handleCloseDate}
                        disabledBefore={false}/>
                }
            </div>

            <div>
                <div className='textlst outside mb-3'>
                    <h3 className="textlst title">시간</h3>
                    <span className='font-bold'>{filters.time}:00</span>
                </div>
                <TimeFilter value={filters.time} onTimeSelect={(val) => handleChange('time', val)} showLabel={false}/>
            </div>
            <button onClick={()=>handleFetchData()} className='px-3 py-1 bg-black cursor-pointer'>확인</button>
        </div>
    )
}
