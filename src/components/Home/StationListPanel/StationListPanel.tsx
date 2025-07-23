'use client'

import React, {useState, useRef} from 'react'

// import FilterModal from '../Filter/FilterModal';
// import StationDetailPanal from '';
import Toast from '@/components/Toast/Toast';
import { StationListItem } from '@/types/dto';
import nmToid from '../../../db/busi_id.json';
import style from './StationListPanel.module.css';
import { FiFilter } from "react-icons/fi";
import { TfiFilter } from "react-icons/tfi";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { TfiSearch } from "react-icons/tfi";
import { FiSearch } from "react-icons/fi"; // 더짧고 굵음

interface Filters {
  lat: number;
  lon: number;
  radius: number;
  canUse: boolean;
  parkingFree: boolean;
  limitYn: boolean;
  chargerTypes: string[];
  chargerComps: string[];
  outputMin: number;
  outputMax: number;
  keyWord?: string;
}

interface StationListModalProps {
  // onClose: () => void;
  list: StationListItem[] ;
  currentFilter: Filters;
  onFilterChange: (filters: Omit<Filters, 'lat' | 'lon'>) => void;
  onStationClick: (station: StationListItem | null) => void;
  onSearch: (keyword: string) => void;
}

export default function StationListPanel({
  // onClose,
  list,
  currentFilter,
  onFilterChange,
  onStationClick,
  onSearch
}: StationListModalProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  // const [selectedStation, setSelectedStation] = useState<StationListItem | null>(null);
  const closeDetailRef = useRef<HTMLButtonElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null >(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // 1. 검색
  const searchPlaces = () => {
    const keyword = searchRef.current?.value || '';
    onSearch(keyword);
  }

  // 2. 필터적용
  const handleApplyFilters = (newFilters:  Omit<Filters , 'lat' | 'lon' >, msg?: string) =>{
    if(msg){
      setToastMessage(msg);
    }
    setIsFilterOpen(false);
    onFilterChange(newFilters);
  }

  // 3. 충전소 클릭
  const handleStationClick = (station: StationListItem) => {
    // setSelectedStation(station);
    onStationClick(station);
  }

  // 4. 상세정보 패널 닫기
  const handleCloseDetailPanel = () => {
    onStationClick(null); // 중앙화
  }

  return (
    <>
    {/* <button className='w-8 h-8 bg-black' onClick={()=>setIsSearchOpen(!isSearchOpen)}></button> */}
      {/* 검색 */}
        {isSearchOpen 
        ?<div className='flex gap-2'>
          <div className='flex-1 border-[#4FA969] h-10 justify-between'>
            <input  type="text" placeholder='충전소를 검색하세요'  className="outline-none" />
            <button className={`${style.searchBtn} h-8`} onClick={()=>{searchPlaces()}}><FiSearch size={20} /></button>
          </div>
          <span className={`${style.searchBtn} h-8`}><FiFilter size={20}/></span>
        </div>
        :<div className='flex gap-2'>
          <button className={`${style.searchBtn} h-8`}  onClick={()=>setIsSearchOpen(!isSearchOpen)}><FiSearch size={20} /></button>
          <span className={`${style.searchBtn} h-8`}><FiFilter size={20}/></span>
        </div>
        }
        
    </>
      
  )
}
