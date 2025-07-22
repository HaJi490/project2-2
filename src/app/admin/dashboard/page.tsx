'use client'

import React from 'react'
import axios from 'axios';
import { useAtom } from 'jotai';

import { accessTokenAtom } from '@/store/auth';
import style from './dashboard.module.css'
import {
  FiBox,
  FiMapPin,
  FiTrendingUp,
  FiFileText,
  FiArrowUpRight,
  FiPlus,
} from 'react-icons/fi';

import DemandHeatmap from '@/components/Admin/charts/DemandHeatmap/DemandHeatmap';
import FilterGroup, { HeatmapFilter } from '@/components/Admin/filters/FilterGroup';
import ChargingDemandLineChart from '@/components/Admin/charts/ChargingDemandLineChart/ChargingDemandLineChart';
import DelayStageBarChart from '@/components/Admin/charts/DelayStageBarChart/DelayStageBarChart';

export default function page() {
  const [token] = useAtom(accessTokenAtom);
  // 바뀐필터 요청
  const handleFilterChange = (filter: HeatmapFilter) => {
    console.log(filter)
    try{
      // const res = await axios.post(`http://${process.env.NEXT_PUBLIC_BACKIP}:8080/reserve/setslotsCancel`,
      //   filter,
      //   { headers: { Authorization: `Bearer ${token}` } }
      // )
    } catch(error) {
      console.error('handleFilterChange: ', error)
    }
  }


  return (
    <div className={style.dashboard_page}>
      {/* 대시보드 헤더 */}
      <div className={style.dashboard_header}>
        <div className={`${style.stat_card}`}>
          <h2 className={style.stat_value}>Dashboard</h2>
          <p className={style.stat_label}>June 25 - July 29, 2025</p>
        </div>
        {/* 상단 통계 */}
          <div className={style.stat_grid}>
            <div className={` ${style.stat_card}`}>
              <h2 className={style.stat_value}>7062</h2>
              <p className={style.stat_label}>전체 충전소 수</p>
            </div>
            <div className={` ${style.stat_card}`}>
              <h2 className={style.stat_value}>34</h2>
              <p className={style.stat_label}>사용중</p>
            </div>
            <div className={` ${style.stat_card}`}>
              <h2 className={style.stat_value}>2</h2>
              <p className={style.stat_label}>고장</p>
            </div>
            <div className={` ${style.stat_card}`}>
              <h2 className={style.stat_value}>34</h2>
              <p className={style.stat_label}>평균혼잡도</p>
            </div>
          </div>
      </div>
      {/* 메인 그리드 */}
      <main className={style.dashboard_grid}>
        {/* Map Preview */}
        <div className={`${style.card} ${style.card_map}`}>
          <h2>혼잡도 히트맵</h2>
          <div className={`text-[#718096] h-[450px] w-full flex items-start gap-8 p-4`}>
            <div className='w-1/4 flex-shrink-0'>
              <FilterGroup onFilterChange={handleFilterChange}/>
            </div>
            <div className='flex-1 h-full'>
              <DemandHeatmap/>
            </div>
          </div>
        </div>
        <div className={`${style.card} ${style.card_borrowers} `}>
          <h2>충전소 수요예측</h2>
          <div className={`${style.card_content}`}>
            {/* <GuSelector/> */}
            <ChargingDemandLineChart />
          </div>
        </div>

        {/* Details (가로로 긴 카드) */}
        <div className={`${style.card} ${style.card_details} `}>
          <h2>충전후 출발지연 5단계</h2>
          <div className={`${style.card_content}`}>
            <DelayStageBarChart/>
          </div>
        </div>

        {/* New Request Trend */}
        <div className={`${style.card} ${style.card_trend} `}>
          <h2>New Request Trend</h2>
          <div className={`${style.card_content}`}>...차트 구현...</div>
        </div>
      </main>
    </div>
  )
}
