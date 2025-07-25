'use client'

import React,{useState} from 'react'
import Map, {Source, Layer, Marker,Popup } from 'react-map-gl/mapbox';
import type { HeatmapLayer } from 'mapbox-gl'; 
import 'mapbox-gl/dist/mapbox-gl.css';
import type { FeatureCollection, Point } from 'geojson';

import GuSelector, { busanDistricts, type District } from '../ChargingDemandLineChart/GuSelector';
import {HeatmapFeatureCollection} from '../../../../types/geojson'
import { heatmapData } from '@/db/heatmap_data';

// type features = {
//   type: string,
//   geometry: {
//     type: string,
//     coordinates: [number, number],
//   },
//   properties: {
//     id: string,
//     name: string,
//     addr: string,
//     demand: number,
//   }
// }

// type points = {
//   type: string,
//   features: features[],
// }

interface DemandHeatmapProps {
  pointsDt:  FeatureCollection<Point, {
    id: string;
    name: string;
    addr: string;
    demand: number;
  }> | null,
}

export default function DemandHeatmap({pointsDt}: DemandHeatmapProps) {
  if(!pointsDt) {
    return <div className='w-full h-full flex justify-center items-center bg-gray-50 text-2xl font-bold text-gray-400'>지도 불러오는 중</div>
  }
  
  const [viewState, setViewState] = useState({    // 지도의 상태를 state로 관리(초기값은 부산시 전체)
    longitude: busanDistricts[0].longitude,
    latitude: busanDistricts[0].latitude,
    zoom: busanDistricts[0].zoom,
  });
  const [showMarker, setShowMarker] = useState<boolean>(true);
  const [selectedMarker, setSelectedMarker] = useState(null);

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

  // 2. 마커처럼
  
  // 2. 마커 클릭시
  const handleMarkerClick =(e, feature) => {
    console.log('마커클릭⭐⭐⭐⭐')
    
    e.originalEvent.stopPropagation(); // Map의 onClick 이벤트가 함께 실행되는 것을 막음
    setSelectedMarker(feature);
  }

  React.useEffect(() => {
    console.log('selectedMarker 바뀜:', selectedMarker);
  }, [selectedMarker]);

  // 마커 on/off




  // 3. 드롭박스에서 구를 선택했을 때 호출될 함수입니다.
  // const handleGuSelect = (district: District) => {
  //   // 선택된 구의 위치 정보로 viewState를 업데이트합니다.
  //   setViewState({
  //     longitude: district.longitude,
  //     latitude: district.latitude,
  //     zoom: district.zoom,
  //   });
  // };



  return (
    <div className='relative w-full h-full'>
    <Map mapboxAccessToken={`${process.env.NEXT_PUBLIC_MAPBOX}`}
        // 초기 지도 위치설정
        {...viewState}
        // 지도를 담을 div의 스타일
        style={{width: '100%', height: '100%'}}
        onMove={evt => setViewState(evt.viewState)} // 사용자가 지도를 움직여도 state가 업데이트되도록 함
        onClick={() => {setSelectedMarker(null); console.log('팝업닫기');}} // 지도의 빈곳을 클릭했을때
        // Mapbox에서 제공하는 기본 지도 스타일
        mapStyle="mapbox://styles/mapbox/light-v11"
    >
      <Source id="my-heatmap-data" type="geojson" data={pointsDt}>
        <Layer {...heatmapLayerStyle} />
      </Source>

      {showMarker && pointsDt && (
        pointsDt?.features.map((f => (
          <Marker
            key={f.properties.id}
            longitude={f.geometry.coordinates[0]}
            latitude={f.geometry.coordinates[1]}
          >
            <div className='w-2 h-2 m-50 bg-red-500 rounded-full cursor-pointer'
                onClick={(e) => handleMarkerClick(e, f)}
            ></div>
          </Marker>
        )))
      )
      }
      
      {selectedMarker &&
        <Popup
          longitude = {selectedMarker.geometry.coordinates[0]}
          latitude = {selectedMarker.geometry.coordinates[1]}
          onClose = {()=>setSelectedMarker(null)}
          anchor='bottom' // 마커의 어느방향
          focusAfterOpen={true} // 팝업닫힐때 포커스로 지도로 보낼지
          closeOnClick={false}  //Map의 onClick으로 제어
        >
          <div>
            <p>이름: {selectedMarker.properties.name}</p>
            <p>주소: {selectedMarker.properties.addr}</p>
            <p>운영기관: {selectedMarker.properties.demand}</p>
          </div>
        </Popup>
      }
    </Map>
    <button className='absolute top-0 right-0 bg-black text-white' onClick={() => setShowMarker((prev) => !prev)}>
        {showMarker ? '마커 off' : '마커 on'}
    </button>
    {/* 6. 지도 위에 드롭박스 컴포넌트를 렌더링합니다. */}
    {/* <GuSelector onGuSelect={handleGuSelect} /> */}
    </div>
  )
}
