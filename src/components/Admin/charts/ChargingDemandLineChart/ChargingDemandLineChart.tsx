'use client'

import React from 'react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

import style from './ChargingDemandLineChart.module.css'

  // 1. 한달 수요 예측 데이터
  const forecastData = [
    { date: '2025-07-21', demand: 120 },
  { date: '2025-07-22', demand: 135 },
  { date: '2025-07-23', demand: 110 },
  { date: '2025-07-24', demand: 98 },
  { date: '2025-07-25', demand: 115 },
  { date: '2025-07-26', demand: 140 },
  { date: '2025-07-27', demand: 162 },
  { date: '2025-07-28', demand: 180 },
  { date: '2025-07-29', demand: 167 },
  { date: '2025-07-30', demand: 148 },
  { date: '2025-07-31', demand: 145 },
  { date: '2025-08-01', demand: 140 },
  { date: '2025-08-02', demand: 134 },
  { date: '2025-08-03', demand: 122 },
  { date: '2025-08-04', demand: 108 },
  { date: '2025-08-05', demand: 122 },
  { date: '2025-08-06', demand: 107 },
  { date: '2025-08-07', demand: 124 },
  { date: '2025-08-08', demand: 131 },
  { date: '2025-08-09', demand: 113 },
  { date: '2025-08-10', demand: 94 },
  { date: '2025-08-11', demand: 90 },
  { date: '2025-08-12', demand: 90 },
  { date: '2025-08-13', demand: 90 },
  { date: '2025-08-14', demand: 102 },
  { date: '2025-08-15', demand: 120 },
  { date: '2025-08-16', demand: 101 },
  { date: '2025-08-17', demand: 116 },
  { date: '2025-08-18', demand: 108 },
  { date: '2025-08-19', demand: 122 },
  { date: '2025-08-20', demand: 128 }
  ];

  // 2. 마우스를 올렸을 때 보여줄 커스텀 툴팁 컴포넌트
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={style.custom_tooltip}>
          <p className={style.custom_label}>{`수요량: ${payload[0].value}`}</p>
          <p className={style.custom_intro}>{`날짜: ${label}`}</p>
        </div>
      );
    }
    return null;
  };

export default function ChargingDemandLineChart() {

  // 3. 차트 클릭 시 실행될 함수-------------------------------------❗클릭했을때 데이터 못가져옴
  const handleChartClick = (chartState: any) => {
    // chartState.activePayload: 클릭된 지점의 데이터가 배열
    if (chartState && chartState.activePayload && chartState.activePayload.length > 0) {  
      // 2. 콘솔에 전체 상태 객체를 찍어 구조를 확인해봅니다.
      console.log("--- Recharts가 전달한 전체 상태 객체 (chartState) ---");
      console.log(chartState);

      const clickedData = chartState.activePayload[0].payload;
      console.log("--- 클릭된 지점의 원본 데이터 (clickedDataPayload) ---");
      console.log('클릭된 데이터:', clickedData);
      
      // 여기에 백엔드로 데이터를 보내는 로직을 추가
      // 예: sendDataToBackend(clickedData);
      alert(`선택된 날짜: ${clickedData.date}, 수요량: ${clickedData.demand}`);
    } else {
      // 빈 공간을 클릭했을 때
      console.log("차트의 데이터 포인트가 아닌 빈 공간이 클릭되었습니다.");
    }
  };


  return (
    <div className='w-full h-[350px]'>
      <ResponsiveContainer>
        <AreaChart data={forecastData} onClick={handleChartClick} 
                  margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
          {/* 그라데이션 효과 정의 */}
          <defs>
            <linearGradient id='colorDemand' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#4FA969' stopOpacity={0.8}/>
              <stop offset='95%' stopColor='#4FA969' stopOpacity={0}/>
            </linearGradient>
          </defs>
          {/* X축 (날짜). tickFormatter로 날짜 형식을 보기 좋게 변경 */}
          <XAxis dataKey='date' tickFormatter={(dateStr) => new Date(dateStr).getDate() + '일'}
                tick={{fill: '#888888'}} fontSize={12} dy={10}/>
          {/* y축(수요량) */}
          <YAxis tick={{fill: '#888888'}} fontSize={12}/>
          {/* 배경그리드 */}
          <CartesianGrid strokeDasharray={'3 3'} vertical={false}/>
          {/* 커스텀 툴팁 연결 _ 컴포넌트? */}
          <Tooltip content={<CustomTooltip/>} /> 

          {/* 실제 그래프를 그리는 Area컴포넌트 */}
          <Area type='monotone'
              dataKey='demand'
              stroke='#4FA969'
              strokeWidth={3}
              fillOpacity={1}
              fill='url(#colorDemand)' // 위에서 정의한 그라데이션 id
              activeDot={{r:8, stroke: '#fff', strokeWidth: 2}} // 활성화된 점 스타일
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
