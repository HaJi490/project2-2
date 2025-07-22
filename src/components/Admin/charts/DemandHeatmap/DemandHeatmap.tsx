'use client'

import React,{useState} from 'react'
import Map, {Source, Layer } from 'react-map-gl/mapbox';
import type { HeatmapLayer } from 'mapbox-gl'; 
import 'mapbox-gl/dist/mapbox-gl.css';

import GuSelector, { busanDistricts, type District } from '../ChargingDemandLineChart/GuSelector';
import {HeatmapFeatureCollection} from '../../../../types/geojson'
import { heatmapData } from '@/db/heatmap_data';

export default function DemandHeatmap() {
  // 히트맵 레이어의 스타일을 객체로 정의
  const heatmapLayerStyle : HeatmapLayer = {
    id:'heatmap',
    type: 'heatmap',
    source: 'my-heatmap-data', // 사용할 Source의 id
    maxzoom: 15,
    paint: {
      // 이 속성을 사용하려면 GeoJSON의 properties에 'intensity'가 있어야 합니다.
      'heatmap-weight': [
        'interpolate', ['linear'], ['get', 'intensity'],
        0, 0,
        1, 1
      ],
      // 히트맵의 가중치(강도): 각 점의 'intensity' 속성을 사용하도록 설정
      'heatmap-intensity': [
        'interpolate', ['linear'], ['zoom'],
        0, 1,
        15, 3
      ],
      // 히트맵 색상: 밀집도에 따라 색이 변하도록 설정
      'heatmap-color' : [
        'interpolate', ['linear'], ['heatmap-density'],
        0, 'rgba(33,102,172,0)',
        0.2, 'rgb(103,169,207)',
        0.4, 'rgb(209,229,240)',
        0.6, 'rgb(253,219,199)',
        0.8, 'rgb(239,138,98)',
        1, 'rgb(178,24,43)'
      ],
      // 각 점의 영향 반경(radius)
      'heatmap-radius': [
        'interpolate', ['linear'], ['zoom'],
        0, 2,
        15, 20
      ],
       // 줌 레벨이 높아지면 히트맵을 서서히 투명하게 만듦
      // 'heatmap-opacity': [
      //   'interpolate', ['linear'], ['zoom'],
      //   10, 1,
      //   15, 0
      // ],
    }
  }

  // 2. 지도의 상태를 state로 관리합니다. 초기값은 부산시 전체입니다.
  const [viewState, setViewState] = useState({
    longitude: busanDistricts[0].longitude,
    latitude: busanDistricts[0].latitude,
    zoom: busanDistricts[0].zoom,
  });

  // 3. 드롭박스에서 구를 선택했을 때 호출될 함수입니다.
  const handleGuSelect = (district: District) => {
    // 선택된 구의 위치 정보로 viewState를 업데이트합니다.
    setViewState({
      longitude: district.longitude,
      latitude: district.latitude,
      zoom: district.zoom,
    });
  };



  return (
    <div className='relative w-full h-full'>
    <Map mapboxAccessToken={`${process.env.NEXT_PUBLIC_MAPBOX}`}
        // 초기 지도 위치설정
        {...viewState}
        // 지도를 담을 div의 스타일
        style={{width: '100%', height: '100%'}}
        onMove={evt => setViewState(evt.viewState)} // 사용자가 지도를 움직여도 state가 업데이트되도록 함
        // Mapbox에서 제공하는 기본 지도 스타일
        mapStyle="mapbox://styles/mapbox/light-v11"
    >
      <Source id="my-heatmap-data" type="geojson" data={heatmapData}>
        <Layer {...heatmapLayerStyle} />
      </Source>
    </Map>
    {/* 6. 지도 위에 드롭박스 컴포넌트를 렌더링합니다. */}
    {/* <GuSelector onGuSelect={handleGuSelect} /> */}
    </div>
  )
}
